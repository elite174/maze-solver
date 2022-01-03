import type { CellValue, Key, Door } from "./types.ts";

export const Cell: Record<string, CellValue> = {
  Empty: ".",
  Wall: "#",
  Treasure: "$",
  Player: "<",
  Exit: ">",
};

export const CellToNumber: Record<string, number> = {
  [Cell.Empty]: 100,
  [Cell.Wall]: 0,
  [Cell.Treasure]: 1,
  [Cell.Player]: 777,
  [Cell.Exit]: 999,
};

export const baseKeyValue = 1000;
export const doorsOffset = 100;

export const keys = "abcdefghij";
export const doors = keys.toUpperCase();

for (let i = 0; i < keys.length; i++) {
  Cell[keys[i]] = keys[i] as Key;
  Cell[doors[i]] = doors[i] as Door;
  CellToNumber[Cell[keys[i]]] = baseKeyValue + i;
  CellToNumber[Cell[doors[i]]] = baseKeyValue + doorsOffset + i;
}

export const NumberToCell: Record<number, CellValue> = {};

Object.entries(CellToNumber).forEach(([key, value]) => {
  NumberToCell[value] = key as CellValue;
});

export const keySet = new Set(keys);
export const doorSet = new Set(doors);

export const currentXOffset = `16+width*height+1`;
export const endOffset = "16+width*height+2";
export const li0Offset = `16+width*height+3`;
export const li1Offset = `16+width*height+4`;
export const flagOffset = `16+width*height+5`
export const currentX = `PEEK(${currentXOffset})`;
export const endX = `PEEK(${endOffset})`;
