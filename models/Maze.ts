import { CellToNumber, Cell, NumberToCell } from "../constants.ts";
import { PositionResolver } from "./PositionResolver.ts";
import { isKey, isDoor, gridNodeToCoordinates } from "../utils.ts";
import { Coordinates } from "./Coordinates.ts";

import type {
  CellValue,
  SequencePath,
  ReachableItem,
  ReachableItemWithPath,
} from "../types.ts";

type CC = {
  emptyCellCount: number;
  items: ReachableItem[];
};

const pickRandom = <T>(items: T[]): T =>
  items[0 + Math.floor(Math.random() * items.length)];

const getPathCacheKey = (from: Coordinates, to: Coordinates) => `${from}:${to}`;

const getItemsCacheKey = (from: Coordinates, keys: string) =>
  `${from}: ${keys}`;
export class Maze {
  private maze: number[][] = [];

  private positionResolver: PositionResolver;

  private collectedKeys: string = "";

  constructor(
    private mazeRawStrings: string[],
    private pathCache: Map<string, Coordinates[]>,
    private reachableItemsCache: Map<string, ReachableItem[]>,
    private pickKeyChance: number,
    private pickClosestChance: number,
    private lookingRadius = 90
  ) {
    this.constructMaze();

    this.positionResolver = new PositionResolver(mazeRawStrings);
  }

  private transformCellToNumber(cellValue: CellValue): number {
    if (CellToNumber[cellValue] === undefined) {
      throw Error(`Invalid cell value: "${cellValue}"`);
    }

    // we need to transform doors into walls of empty cells
    if (isDoor(cellValue)) {
      // door is a wall at the start
      return CellToNumber[Cell.Wall];
    }

    // Hide exit and player at the beginning
    if (cellValue === Cell.Exit) return CellToNumber[Cell.Wall];
    if (cellValue === Cell.Player) return CellToNumber[Cell.Empty];

    return CellToNumber[cellValue];
  }

  private constructMaze() {
    this.maze = [];

    for (const mazeRow of this.mazeRawStrings) {
      const mazeRowData: number[] = [];

      for (const cellValue of mazeRow) {
        mazeRowData.push(this.transformCellToNumber(cellValue as CellValue));
      }

      this.maze.push(mazeRowData);
    }
  }

  findConnectedComponents() {
    const emptyCellSet: Set<string> = new Set();

    for (let i = 0; i < this.mazeRawStrings.length; i++) {
      for (let j = 0; j < this.mazeRawStrings[i].length; j++) {
        if (this.mazeRawStrings[i][j] === Cell.Empty) {
          emptyCellSet.add(Coordinates.toString(i, j));
        }
      }
    }

    console.log("Empty cells added");

    const connectedComponents: CC[] = [];

    while (emptyCellSet.size > 0) {
      const result: CC = { emptyCellCount: 0, items: [] };

      const visitedPositions: Set<string> = new Set();
      const stack: Coordinates[] = [
        Coordinates.fromString(emptyCellSet.values().next().value as string),
      ];

      console.log(`start: ${stack[0]}`);

      while (stack.length > 0) {
        const currentPosition = stack.pop()!;

        // If current cell is unusual, add to result
        if (
          this.mazeRawStrings[currentPosition.i][currentPosition.j] ===
          Cell.Empty
        ) {
          result.emptyCellCount += 1;
          emptyCellSet.delete(currentPosition.toString());
        } else {
          result.items.push({
            cellValue: this.mazeRawStrings[currentPosition.i][
              currentPosition.j
            ] as CellValue,
            position: currentPosition,
          });
        }

        visitedPositions.add(currentPosition.toString());

        for (
          let i = Math.max(0, currentPosition.i - 1);
          i <= Math.min(this.maze.length, currentPosition.i + 1);
          i++
        ) {
          for (
            let j = Math.max(0, currentPosition.j - 1);
            j <= Math.min(this.maze[i].length, currentPosition.j + 1);
            j++
          ) {
            if (visitedPositions.has(Coordinates.toString(i, j))) continue;

            if (isDoor(this.mazeRawStrings[i][j])) {
              result.items.push({
                cellValue: this.mazeRawStrings[i][j] as CellValue,
                position: new Coordinates(i, j),
              });

              visitedPositions.add(Coordinates.toString(i, j));
              continue;
            }

            if (
              this.mazeRawStrings[i][j] !== Cell.Wall &&
              !visitedPositions.has(Coordinates.toString(i, j))
            ) {
              stack.push(new Coordinates(i, j));
              visitedPositions.add(Coordinates.toString(i, j));
            }
          }
        }
      }

      connectedComponents.push(result);

      console.log(`Connected component size: ${result.emptyCellCount}`);
      console.log("  Items:");
      result.items.forEach((item) =>
        console.log(`    ${item.cellValue}: ${item.position.toString()}`)
      );
    }
  }

  private findReachableItems(position: Coordinates): ReachableItem[] {
    const key = getItemsCacheKey(position, this.collectedKeys);

    if (this.reachableItemsCache.has(key)) {
      return this.reachableItemsCache.get(key)!;
    }

    const result: ReachableItem[] = [];

    const visitedPositions: Set<string> = new Set();
    const stack = [position];

    while (stack.length > 0) {
      const currentPosition = stack.pop()!;

      // If current cell is unusual, add to result
      if (
        this.maze[currentPosition.i][currentPosition.j] !==
        CellToNumber[Cell.Empty]
      ) {
        result.push({
          cellValue:
            NumberToCell[this.maze[currentPosition.i][currentPosition.j]],
          position: currentPosition,
        });
      }

      visitedPositions.add(currentPosition.toString());

      for (
        let i = Math.max(0, currentPosition.i - 1);
        i <= Math.min(this.maze.length, currentPosition.i + 1);
        i++
      ) {
        for (
          let j = Math.max(0, currentPosition.j - 1);
          j <= Math.min(this.maze[i].length, currentPosition.j + 1);
          j++
        ) {
          if (visitedPositions.has(Coordinates.toString(i, j))) continue;

          if (
            this.maze[i][j] !== CellToNumber[Cell.Wall] &&
            !visitedPositions.has(Coordinates.toString(i, j))
          ) {
            stack.push(new Coordinates(i, j));
            visitedPositions.add(Coordinates.toString(i, j));
          }
        }
      }
    }

    return result;
  }

  private findClosestItem(
    currentPosition: Coordinates,
    reachableItems: ReachableItem[]
  ): ReachableItemWithPath | null {
    if (reachableItems.length === 0) return null;

    let closestItem: ReachableItemWithPath;
    let closestPath = Infinity;

    let minItems: ReachableItemWithPath[] = [];

    for (const item of reachableItems) {
      const path = this.searchPath(currentPosition, item.position);

      // It's impossible but still need to check
      if (path.length === 0)
        throw new Error(
          `Impossible to find path to reachable item ${item.cellValue} at ${item.position}`
        );

      if (path.length === closestPath) {
        minItems.push({ ...item, path });
      }

      if (path.length < closestPath) {
        closestPath = path.length;
        minItems = [{ ...item, path }];
      }
    }

    return pickRandom(minItems);
  }

  private makeCellEmpty(position: Coordinates) {
    this.maze[position.i][position.j] = CellToNumber[Cell.Empty];
  }

  // by default we need to collect all the keys and all the treasures
  private eatKeyOrTreasure(item: ReachableItem) {
    const { cellValue, position } = item;

    const isCellKey = isKey(cellValue);
    const isCellTreasure = cellValue === Cell.Treasure;

    if (!isCellKey && !isCellTreasure)
      throw new Error(`We try to eat some weird cell: ${cellValue}`);

    if (isKey(cellValue)) {
      const relatedDoorPosition = this.positionResolver.getPosition(
        // TODO refactor this line
        // probably we don't need to store doors and keys inside Cell
        CellToNumber[Cell[cellValue.toUpperCase()]]
      );

      this.makeCellEmpty(relatedDoorPosition);
    }

    this.makeCellEmpty(position);

    this.collectedKeys += cellValue;
    this.collectedKeys = this.collectedKeys.split("").sort().join("");
  }

  // this method replaces a wall-placeholder for the exit to the real exit value
  private revealExit() {
    const { i, j } = this.positionResolver.getPosition(CellToNumber[Cell.Exit]);

    this.maze[i][j] = CellToNumber[Cell.Exit];
  }

  private searchPath(from: Coordinates, to: Coordinates): Coordinates[] {
    const key = getPathCacheKey(from, to);

    if (this.pathCache.has(key)) {
      return this.pathCache.get(key)!;
    }

    const graph = new Graph(this.maze);

    const path = astar
      .search(graph, graph.grid[from.i][from.j], graph.grid[to.i][to.j])
      .map(gridNodeToCoordinates);

    this.pathCache.set(key, path);

    return path;
  }

  private getItemsInRadius(
    currentPosition: Coordinates,
    items: ReachableItem[]
  ): ReachableItemWithPath[] {
    const result: ReachableItemWithPath[] = [];

    for (const item of items) {
      const path = this.searchPath(currentPosition, item.position);

      if (path.length <= this.lookingRadius) {
        result.push({ ...item, path });
      }
    }

    return result;
  }

  // Return sequence doesn't include the starting position of the player
  solve(playerPosition: Coordinates): [SequencePath, number] {
    const sequencePath: SequencePath = [];
    let pathLength = 0;

    let currentPosition = playerPosition;
    let reachableItems = this.findReachableItems(playerPosition);

    if (reachableItems.length === 0)
      throw new Error(
        `Something goes wrong, because we can't reach any item from the start...`
      );

    while (reachableItems.length > 0) {
      const itemsInRadius = this.getItemsInRadius(
        currentPosition,
        reachableItems
      );

      let closestItem: ReachableItemWithPath | null;

      if (itemsInRadius.length > 0) {
        closestItem = itemsInRadius[0];

        for (let i = 1; i < itemsInRadius.length; i++) {
          if (closestItem.path.length > itemsInRadius[i].path.length) {
            closestItem = itemsInRadius[i];
          }
        }
      } else {
        const reachableKeys: ReachableItem[] = [];
        const reachableTreasures: ReachableItem[] = [];

        reachableItems.forEach((item) => {
          if (isKey(item.cellValue)) {
            reachableKeys.push(item);
          } else {
            reachableTreasures.push(item);
          }
        });

        const chanceToPickKey =
          reachableTreasures.length === 0
            ? 1
            : reachableKeys.length === 0
            ? 0
            : this.pickKeyChance;

        const closest = Math.random() < this.pickClosestChance;

        const items =
          Math.random() < chanceToPickKey ? reachableKeys : reachableTreasures;

        closestItem = this.findClosestItem(
          currentPosition,
          closest ? items : [pickRandom(items)]
        );
      }

      if (closestItem === null)
        throw new Error("The closest item is null => what???");

      sequencePath.push({
        cell: closestItem.cellValue,
        path: closestItem.path,
      });

      pathLength += closestItem.path.length;

      this.eatKeyOrTreasure(closestItem);

      // go to item position
      currentPosition = closestItem.position;
      // Scan for reachable items again
      reachableItems = this.findReachableItems(currentPosition);
    }

    // Here we collected all the items, so now we need to go to the exit
    this.revealExit();

    const pathToExit = this.searchPath(
      currentPosition,
      this.positionResolver.getPosition(CellToNumber[Cell.Exit])
    );

    sequencePath.push({
      cell: Cell.Exit,
      path: pathToExit,
    });

    pathLength += pathToExit.length;

    return [sequencePath, pathLength];
  }
}
