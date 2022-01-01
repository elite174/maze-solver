export class Coordinates {
  private static getStringRepresentation(i: number, j: number) {
    return `${i}-${j}`;
  }

  static toString(i: number, j: number) {
    return this.getStringRepresentation(i, j);
  }

  constructor(public i: number, public j: number) {}

  toString() {
    return Coordinates.getStringRepresentation(this.i, this.j);
  }
}
