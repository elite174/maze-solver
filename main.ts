import "./external/astar.js";

import { Maze } from "./models/Maze.ts";
import { XennialConverter } from "./models/XennialConverter.ts";
import { Coordinates } from "./models/Coordinates.ts";
import { writeResultsTo } from "./utils.ts";

const MAZE_FILE_NAME = "./data/maze.txt";
const RESULT_PATH_FILE_NAME = "./data/result-path.txt";
const XENNIAL_FILE_NAME = "./data/xennial.txt";

const PLAYER_POSITION = new Coordinates(1, 1);
const INSTRUCTIONS_START_LINE = 3050;

const writeProgram = (xennialInstructions: string[]) => {
  const initialization = `3000 LET c = 16+width*height+1
3001 LET e = 16+width*height+2
3002 LET li_0 = 16+width*height+3
3003 LET li_1 = 16+width*height+4
3004 LET CX = PEEK(c)
3005 LET EX = PEEK(e)
3006 REM PRINT "X:";CX;"EX:";EX
3008 IF CX = EX and EX > 0 THEN
3009  CX=0
3010  POKE c,0
3011  GOSUB 6000
3013 END IF
3014 GOTO ${INSTRUCTIONS_START_LINE}+256*PEEK(li_1)+PEEK(li_0)`;

  const steps = xennialInstructions.join("\r\n");

  const incSubRoutine = `6000 REM inc li
6001 IF PEEK(li_0)+1 < 256 THEN
6002   POKE li_0,PEEK(li_0)+1
6003 ELSE
6004   POKE li_0,0
6005   POKE li_1,PEEK(li_1)+1
6006 END IF
6007 RETURN`;

  writeResultsTo(initialization, XENNIAL_FILE_NAME);
  writeResultsTo(steps, XENNIAL_FILE_NAME, false);
  writeResultsTo(incSubRoutine, XENNIAL_FILE_NAME, false);
};

const decoder = new TextDecoder("utf-8");
const mazeRawStrings = decoder
  .decode(Deno.readFileSync(MAZE_FILE_NAME))
  .replaceAll("\r", "")
  .split("\n");
const maze = new Maze(mazeRawStrings);
const sequence = maze.solve(PLAYER_POSITION);

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

writeResultsTo(pathStrings.join("\r\n"), RESULT_PATH_FILE_NAME);

const converter = new XennialConverter(3050, PLAYER_POSITION);
const xennialStrings = converter.convertPath(resultPath);

writeProgram(xennialStrings);

console.log('Done!');
