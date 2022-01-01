import { CellToNumber, Cell, NumberToCell } from "./constants.ts";
import { Position } from "./position.ts";
import { isKey, isDoor } from "./utils.ts";

import type { Coordinates, Key, Door, CellValue } from "./types.ts";

type ReachableItem = [CellValue, Coordinates];

const coordsToString = (coords: Coordinates) => `${coords[0]}-${coords[1]}`;

export class Maze {
  static gridNodeToCoordinates(node: GridNode): Coordinates {
    return [node.x, node.y];
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
        this.maze[currentPosition[0]][currentPosition[1]] !==
        CellToNumber[Cell.Empty]
      ) {
        result.push([
          NumberToCell[this.maze[currentPosition[0]][currentPosition[1]]],
          currentPosition,
        ]);
      }

      visitedPositions.add(coordsToString(currentPosition));

      for (
        let i = Math.max(0, currentPosition[0] - 1);
        i <= Math.min(this.maze.length, currentPosition[0] + 1);
        i++
      ) {
        for (
          let j = Math.max(0, currentPosition[1] - 1);
          j <= Math.min(this.maze[i].length, currentPosition[1] + 1);
          j++
        ) {
          if (visitedPositions.has(coordsToString([i, j]))) continue;

          if (
            this.maze[i][j] !== CellToNumber[Cell.Wall] &&
            !visitedPositions.has(coordsToString([i, j]))
          ) {
            stack.push([i, j]);
          }

          if (this.maze[i][j] === CellToNumber[Cell.Treasure])
            availableTreasures += 1;

          visitedPositions.add(coordsToString([i, j]));
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
      const path = this.searchPath(currentPosition, item[1]);

      // It's impossible but still need to check
      if (path.length === 0)
        throw new Error(
          `Impossible to find path to reachable item ${
            item[0]
          } at ${coordsToString(item[1])}`
        );

      if (path.length < closestPath) {
        closestPath = path.length;
        closestItem = item;
      }
    }

    return closestItem!;
  }

  private collectAndGoTo(item: ReachableItem) {
    
  }

  getPosition(cell: CellValue): Coordinates {
    return this.positionResolver.getPosition(CellToNumber[cell]);
  }

  searchPath(from: Coordinates, to: Coordinates): Coordinates[] {
    const graph = new Graph(this.maze);

    return astar
      .search(graph, graph.grid[from[0]][from[1]], graph.grid[to[0]][to[1]])
      .map(Maze.gridNodeToCoordinates);
  }

  solve(playerPosition: Coordinates) {
    let currentPosition = playerPosition;
    const reachableItems = this.findReachableItems(playerPosition);

    while (reachableItems.length > 0) {
      const closestItem = this.findClosestItem(currentPosition, reachableItems);

      if (closestItem === null)
        throw new Error("The closest item is null => what???");
    }
  }
}
