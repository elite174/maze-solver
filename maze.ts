import { CellToNumber, Cell, NumberToCell } from "./constants.ts";
import { Position } from "./position.ts";
import { isKey, isDoor } from "./utils.ts";
import { Coordinates } from "./models/Coordinates.ts";

import type { Key, CellValue } from "./types.ts";

type ReachableItem = {
  cellValue: CellValue;
  position: Coordinates;
};

type SequencePath = {
  cell: CellValue;
  path: Coordinates[];
}[];

export class Maze {
  static gridNodeToCoordinates(node: GridNode): Coordinates {
    return new Coordinates(node.x, node.y);
  }

  private treasureCount = 0;

  private allThingsCollected = false;

  private maze: number[][] = [];

  private collectedKeys: Set<Key> = new Set();

  private positionResolver: Position;

  constructor(private mazeRawStrings: string[]) {
    this.constructMaze();

    this.positionResolver = new Position(mazeRawStrings);
  }

  private transformCellToNumber(cellValue: CellValue): number {
    if (CellToNumber[cellValue] === undefined) {
      throw Error(`Invalid cell value: "${cellValue}"`);
    }

    // we need to transform doors into walls of empty cells
    if (isDoor(cellValue)) {
      // if we have key
      if (this.collectedKeys.has(cellValue.toLowerCase() as Key)) {
        // pretend that there's no wall
        return CellToNumber[Cell.Empty];
      } else {
        // door is a wall
        return CellToNumber[Cell.Wall];
      }
    }

    // if we collected a key return empty cell
    if (isKey(cellValue)) {
      if (this.collectedKeys.has(cellValue as Key)) {
        return CellToNumber[Cell.Empty];
      }
    }

    // If we haven't collected all the things, we need to mark exit as wall
    // This prevents from unexpected exit
    if (cellValue === Cell.Exit && !this.allThingsCollected) {
      return CellToNumber[Cell.Wall];
    }

    return CellToNumber[cellValue];
  }

  private constructMaze() {
    this.maze = [];

    for (const mazeRow of this.mazeRawStrings) {
      const mazeRowData: number[] = [];

      for (const cellValue of mazeRow) {
        if (cellValue === Cell.Treasure) this.treasureCount += 1;

        mazeRowData.push(this.transformCellToNumber(cellValue as CellValue));
      }

      this.maze.push(mazeRowData);
    }
  }

  // in case we collect key we need to mark key cell and door cell as empty cells
  collectKey(key: Key) {
    this.collectedKeys.add(key);

    const keyPosition = this.positionResolver.getPosition(CellToNumber[key]);
    const doorPosition = this.positionResolver.getPosition(
      CellToNumber[Cell[key.toUpperCase()]]
    );

    this.maze[keyPosition[0]][keyPosition[1]] = CellToNumber[Cell.Empty];
    this.maze[doorPosition[0]][doorPosition[1]] = CellToNumber[Cell.Empty];
  }

  findReachableItems(position: Coordinates): ReachableItem[] {
    const result: ReachableItem[] = [];

    const visitedPositions: Set<string> = new Set();
    const stack = [position];

    let availableTreasures = 0;

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
          }

          if (this.maze[i][j] === CellToNumber[Cell.Treasure])
            availableTreasures += 1;

          visitedPositions.add(Coordinates.toString(i, j));
        }
      }
    }

    console.log("available treasures: ", availableTreasures);
    return result;
  }

  private findClosestItem(
    currentPosition: Coordinates,
    reachableItems: ReachableItem[]
  ): ReachableItem | null {
    if (reachableItems.length === 0) return null;

    let closestItem: ReachableItem;
    let closestPath = Infinity;

    for (const item of reachableItems) {
      const path = this.searchPath(currentPosition, item.position);

      // It's impossible but still need to check
      if (path.length === 0)
        throw new Error(
          `Impossible to find path to reachable item ${item.cellValue} at ${item.position}`
        );

      if (path.length < closestPath) {
        closestPath = path.length;
        closestItem = item;
      }
    }

    return closestItem!;
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

    console.log(`Eating: ${cellValue} at ${position}`);

    if (isKey(cellValue)) {
      const relatedDoorPosition = this.positionResolver.getPosition(
        // TODO refactor this line
        // probably we don't need to store doors and keys inside Cell
        CellToNumber[Cell[cellValue.toUpperCase()]]
      );

      this.makeCellEmpty(relatedDoorPosition);
    }

    this.makeCellEmpty(position);
  }

  // this method replaces a wall-placeholder for the exit to the real exit value
  private revealExit() {
    const { i, j } = this.positionResolver.getPosition(CellToNumber[Cell.Exit]);

    this.maze[i][j] = CellToNumber[Cell.Exit];
  }

  getPosition(cell: CellValue): Coordinates {
    return this.positionResolver.getPosition(CellToNumber[cell]);
  }

  searchPath(from: Coordinates, to: Coordinates): Coordinates[] {
    const graph = new Graph(this.maze);

    return astar
      .search(graph, graph.grid[from.i][from.j], graph.grid[to.i][to.j])
      .map(Maze.gridNodeToCoordinates);
  }

  solve(playerPosition: Coordinates): SequencePath {
    const sequencePath: SequencePath = [];

    let currentPosition = playerPosition;
    let reachableItems = this.findReachableItems(playerPosition);

    while (reachableItems.length > 0) {
      const closestItem = this.findClosestItem(currentPosition, reachableItems);

      if (closestItem === null)
        throw new Error("The closest item is null => what???");

      this.eatKeyOrTreasure(closestItem);

      // go to item position
      currentPosition = closestItem.position;
      // Scan for reachable items again
      reachableItems = this.findReachableItems(currentPosition);
    }

    // Here we collected all the items, so now we need to go to the exit
    this.revealExit();

    return sequencePath;
  }
}
