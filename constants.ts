import type { CellValue } from "./types.ts";

export const Cell: Record<string, CellValue> = {
  Empty: ".",
  Wall: "#",
  Treasure: "$",
  Player: "<",
  Exit: ">",
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
  I: "I",
};

export const baseKeyValue = 1000;
export const doorsOffset = 100;

export const keys = "abcdefghij";
export const doors = keys.toUpperCase();

export const CellToNumber: Record<string, number> = {
  [Cell.Empty]: 100,
  [Cell.Wall]: 0,
  [Cell.Treasure]: 1,
  [Cell.Player]: 777,
  [Cell.Exit]: 999,
  [Cell.a]: baseKeyValue,
  [Cell.b]: baseKeyValue + 1,
  [Cell.c]: baseKeyValue + 2,
  [Cell.d]: baseKeyValue + 3,
  [Cell.e]: baseKeyValue + 4,
  [Cell.f]: baseKeyValue + 5,
  [Cell.g]: baseKeyValue + 6,
  [Cell.h]: baseKeyValue + 7,
  [Cell.i]: baseKeyValue + 8,
  [Cell.A]: baseKeyValue + doorsOffset,
  [Cell.B]: baseKeyValue + doorsOffset + 1,
  [Cell.C]: baseKeyValue + doorsOffset + 2,
  [Cell.D]: baseKeyValue + doorsOffset + 3,
  [Cell.E]: baseKeyValue + doorsOffset + 4,
  [Cell.F]: baseKeyValue + doorsOffset + 5,
  [Cell.G]: baseKeyValue + doorsOffset + 6,
  [Cell.H]: baseKeyValue + doorsOffset + 7,
  [Cell.I]: baseKeyValue + doorsOffset + 8,
};

export const NumberToCell: Record<number, CellValue> = {};

Object.entries(CellToNumber).forEach(([key, value]) => {
  NumberToCell[value] = key as CellValue;
});

export const keySet = new Set(keys);
export const doorSet = new Set(doors);
