import "./types.ts";
import "./external/astar.js";

import { Cell } from "./constants.ts";
import { Maze } from "./maze.ts";

import { Coordinates } from "./models/Coordinates.ts";

const decoder = new TextDecoder("utf-8");
const mazeRawStrings = decoder
  .decode(Deno.readFileSync("mazedata.txt"))
  .replaceAll("\r", "")
  .split("\n");

const maze = new Maze(mazeRawStrings);
const playerPosition = maze.getPosition(Cell.Player);
//const exitPosition = maze.getPosition(Cell.Exit);
//const someTreasurePosition = maze.getPosition(Cell.Treasure);

maze.solve(playerPosition);
//console.log(maze.findReachableItems([1, 1]));
//console.log(maze.searchPath(playerPosition, new Coordinates(1, 3)));
