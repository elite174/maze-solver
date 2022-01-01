import type { Coordinates } from "./Coordinates.ts";

const enum Direction {
  Right = 0,
  Down,
  Left,
  Up,
}

const directionToString = {
  [Direction.Up]: "Up",
  [Direction.Down]: "Down",
  [Direction.Left]: "Left",
  [Direction.Right]: "Right",
};

export class XennialConverter {
  private currentPosition: Coordinates;

  private currentLineNumber: number;

  constructor(
    initialLineNumber: number,
    initialPosition: Coordinates,
    private withComments = false
  ) {
    this.currentPosition = initialPosition;
    this.currentLineNumber = initialLineNumber;
  }

  convertPath(path: Coordinates[]): string[] {
    const instructions: string[] = [];

    for (const position of path) {
      // i => row
      if (this.currentPosition.i - position.i === 1) {
        instructions.push(this.getInstruction(Direction.Up));
      } else if (this.currentPosition.i - position.i === -1) {
        instructions.push(this.getInstruction(Direction.Down));
      } // j => column
      else if (this.currentPosition.j - position.j === 1) {
        instructions.push(this.getInstruction(Direction.Left));
      } else if (this.currentPosition.j - position.j === -1) {
        instructions.push(this.getInstruction(Direction.Right));
      } else {
        throw new Error(
          `The difference is bigger than 1...: ${this.currentPosition}, ${position}`
        );
      }

      this.currentPosition = position;
    }

    console.log("Total instructions: ", instructions.length);

    return instructions;
  }

  private getInstruction(direction: Direction) {
    return `${this.currentLineNumber++} POKE 0,${direction}${
      this.withComments ? `: REM ${directionToString[direction]}` : ""
    }`;
  }
}
