import type { Coordinates } from "./types.ts";
import { NumberToCell } from "./constants.ts";

export class Position {
  private positionCache: Map<number, Coordinates> = new Map();

  constructor(private mazeRawStrings: string[]) {}

  getPosition(value: number): Coordinates {
    if (this.positionCache.has(value)) {
      return this.positionCache.get(value)!;
    }

    for (let i = 0; i < this.mazeRawStrings.length; i++) {
      for (let j = 0; j < this.mazeRawStrings[i].length; j++) {
        if (NumberToCell[value] === undefined)
          throw new Error(
            `Unable to convert number ${value} to string representation`
          );

        if (this.mazeRawStrings[i][j] === NumberToCell[value]) {
          this.positionCache.set(value, [i, j]);

          return [i, j];
        }
      }
    }

    throw Error(`No coords for value: ${value}`);
  }
}
