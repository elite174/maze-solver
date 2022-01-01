import { keySet, doorSet } from "./constants.ts";
import type { Key, Door } from "./types.ts";

export const isKey = (cellValue: string): cellValue is Key =>
  keySet.has(cellValue);
export const isDoor = (cellValue: string): cellValue is Door =>
  doorSet.has(cellValue);
