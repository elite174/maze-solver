import "./types.ts";
import "./external/astar.js";

import { Cell } from "./constants.ts";
import { Maze } from "./maze.ts";

import { Coordinates } from "./models/Coordinates.ts";

const decoder = new TextDecoder("utf-8");
const mazeRawStrings = decoder
  .decode(Deno.readFileSync("./data/maze.txt"))
  .replaceAll("\r", "")
  .split("\n");

const maze = new Maze(mazeRawStrings);
const playerPosition = maze.getPosition(Cell.Player);

const sequence = maze.solve(playerPosition);

let resultPath: Coordinates[] = [];
sequence.forEach((item) => {
  resultPath = resultPath.concat(item.path);
});

console.log("Result path length is: ", resultPath.length);
