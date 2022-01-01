import { Coordinates } from "./Coordinates.ts";

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

  private currentDirection: Direction | null = null;

  private sameDirectionCount = 0;

  private targetPosition: Coordinates;

  constructor(
    initialLineNumber: number,
    initialPosition: Coordinates,
    private withComments = false
  ) {
    this.currentPosition = initialPosition;
    this.currentLineNumber = initialLineNumber;
    this.targetPosition = new Coordinates(initialPosition.i, initialPosition.j);
  }

  convertPath(path: Coordinates[]): string[] {
    const instructions: string[] = [];

    let direction: Direction | null = null;

    for (const position of path) {
      // i => row
      if (this.currentPosition.i - position.i === 1) {
        direction = Direction.Up;
      } else if (this.currentPosition.i - position.i === -1) {
        direction = Direction.Down;
      } // j => column
      else if (this.currentPosition.j - position.j === 1) {
        direction = Direction.Left;
      } else if (this.currentPosition.j - position.j === -1) {
        direction = Direction.Right;
      } else {
        throw new Error(
          `The difference is bigger than 1...: ${this.currentPosition}, ${position}`
        );
      }

      if (direction === null) throw new Error("Direction is null");

      if (this.currentDirection === null) {
        this.currentDirection = direction;
        this.sameDirectionCount = 1;
      } else {
        if (direction !== this.currentDirection) {
          instructions.push(
            this.getInstruction(this.currentDirection, this.sameDirectionCount)
          );

          this.currentDirection = direction;
          this.sameDirectionCount = 1;
        } else {
          this.sameDirectionCount += 1;
        }
      }

      this.currentPosition = position;
    }

    if (this.sameDirectionCount > 0) {
      instructions.push(
        this.getInstruction(this.currentDirection, this.sameDirectionCount)
      );
    }

    console.log("Total instructions: ", instructions.length);
    console.log(this.targetPosition);

    return instructions;
  }

  private getInstruction(direction: Direction | null, stepsCount: number) {
    if (direction === null) throw new Error("current direction is null");

    return `${this
      .currentLineNumber++} POKE c,CX+1:POKE e,${stepsCount}:POKE 0,${direction}:RETURN${
      this.withComments ? `: REM ${directionToString[direction]}` : ""
    }`;
  }
}
