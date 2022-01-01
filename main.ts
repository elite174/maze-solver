import "./external/astar.js";

import { Maze } from "./maze.ts";
import { XennialConverter } from "./models/XennialConverter.ts";
import { Coordinates } from "./models/Coordinates.ts";

const MAZE_FILE_NAME = "./data/maze.txt";
const RESULT_PATH_FILE_NAME = "./data/result-path.txt";
const XENNIAL_FILE_NAME = "./data/xennial.txt";

const CONVERT_RESULTS = true;
const WRITE_SEQUENCE_TO_FILE = CONVERT_RESULTS || false;
const NEED_TO_SOLVE = WRITE_SEQUENCE_TO_FILE || false;

const PLAYER_POSITION = new Coordinates(1, 1);

const encoder = new TextEncoder();

const writeResultsTo = async (strings: string[], filename: string) => {
  const file = await Deno.open(filename, { write: true });

  strings.forEach((position) =>
    Deno.writeSync(file.rid, encoder.encode(position.toString() + "\r\n"))
  );

  file.close();
};

if (NEED_TO_SOLVE) {
  const decoder = new TextDecoder("utf-8");
  const mazeRawStrings = decoder
    .decode(Deno.readFileSync(MAZE_FILE_NAME))
    .replaceAll("\r", "")
    .split("\n");
  const maze = new Maze(mazeRawStrings);
  const sequence = maze.solve(PLAYER_POSITION);

  if (WRITE_SEQUENCE_TO_FILE) {
    const pathStrings: string[] = [];
    let resultPath: Coordinates[] = [];

    let totalPathLength = 0;

    for (const item of sequence) {
      totalPathLength += item.path.length;
      resultPath = resultPath.concat(item.path);

      item.path.forEach((position) => {
        pathStrings.push(position.toString());
      });
    }

    console.log("Total path length: ", totalPathLength);

    await writeResultsTo(pathStrings, RESULT_PATH_FILE_NAME);

    if (CONVERT_RESULTS) {
      const converter = new XennialConverter(3000, PLAYER_POSITION, true);
      const xennialStrings = converter.convertPath(resultPath);

      await writeResultsTo(xennialStrings, XENNIAL_FILE_NAME);

      console.log("Total xennial commands: ", xennialStrings.length);
    }
  }
}
