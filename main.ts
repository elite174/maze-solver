import "./external/astar.js";

import { Maze } from "./models/Maze.ts";
import { XennialConverter } from "./models/XennialConverter.ts";
import { Coordinates } from "./models/Coordinates.ts";
import { writeResultsTo } from "./utils.ts";
import {
  endOffset,
  currentXOffset,
  li1Offset,
  li0Offset,
  endX,
  flagOffset,
} from "./constants.ts";

import type { ReachableItem } from "./types.ts";

const MAZE_FILE_NAME = "./data/maze.txt";
const RESULT_PATH_FILE_NAME = "./data/result-path.txt";
const XENNIAL_FILE_NAME = "./data/xennial.txt";

const PLAYER_POSITION = new Coordinates(1, 1);
const INSTRUCTIONS_START_LINE = 3050;

const writeProgram = (xennialInstructions: string[]) => {
  const initialization = `3000 LET ENDX = PEEK(${endOffset})
3008 IF ENDX > 1 THEN
3009  POKE ${endOffset}, ENDX - 1
3010  RETURN
3011 ELSE
3012  GOSUB 6000
3013  GOTO ${
    INSTRUCTIONS_START_LINE - 1
  }+256*PEEK(${li1Offset})+PEEK(${li0Offset})
3014 END IF
`;

  const steps = xennialInstructions.join("\r\n") + "\r\n";

  const incSubRoutine = `6000 LET LI_0 = PEEK(${li0Offset})
6001 IF LI_0+1 < 256 THEN
6002   POKE ${li0Offset},LI_0+1
6003 ELSE
6004   POKE ${li0Offset},0
6005   POKE ${li1Offset},PEEK(${li1Offset})+1
6006 END IF
6007 RETURN
`;

  writeResultsTo(initialization, XENNIAL_FILE_NAME);
  writeResultsTo(steps, XENNIAL_FILE_NAME, false);
  writeResultsTo(incSubRoutine, XENNIAL_FILE_NAME, false);
};

const decoder = new TextDecoder("utf-8");
const mazeRawStrings = decoder
  .decode(Deno.readFileSync(MAZE_FILE_NAME))
  .replaceAll("\r", "")
  .split("\n");

let minPath = 2439;

const pathCache: Map<string, Coordinates[]> = new Map();
const reachableItemsCache: Map<string, ReachableItem[]> = new Map();

const radius = 90;

for (let i = 0; i < 150; i++) {
  const maze = new Maze(
    mazeRawStrings,
    pathCache,
    reachableItemsCache,
    0.9,
    0.5,
    radius
  );
  const [sequence, pathLength] = maze.solve(PLAYER_POSITION);

  console.log(`#${i}: Total path length (${radius}): ${pathLength}`);

  if (minPath > pathLength) {
    console.log("FOUND!!!!!!!!!!!!!!!!!!!");
    minPath = pathLength;

    const pathStrings: string[] = [];
    let resultPath: Coordinates[] = [];

    for (const item of sequence) {
      resultPath = resultPath.concat(item.path);

      item.path.forEach((position) => {
        pathStrings.push(position.toString());
      });
    }

    writeResultsTo(pathStrings.join("\r\n"), RESULT_PATH_FILE_NAME);

    const converter = new XennialConverter(3050, PLAYER_POSITION);
    const xennialStrings = converter.convertPath(resultPath);

    writeProgram(xennialStrings);
  }
}
