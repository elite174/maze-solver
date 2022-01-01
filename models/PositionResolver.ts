import { Coordinates } from "./Coordinates.ts";
import { NumberToCell } from "../constants.ts";

export class PositionResolver {
  private positionCache: Map<number, Coordinates> = new Map();

  constructor(private mazeRawStrings: string[]) {}

  getPosition(value: number | undefined): Coordinates {
    if (value === undefined) throw new Error("Unexpected input value");
  
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
          const position = new Coordinates(i, j);

          this.positionCache.set(value, position);

          return position;
        }
      }
    }

    throw Error(`No coords for value: ${value}`);
  }
}
