import { keySet, doorSet } from "./constants.ts";
import type { Key, Door } from "./types.ts";

export const isKey = (cellValue: string): cellValue is Key =>
  keySet.has(cellValue);
export const isDoor = (cellValue: string): cellValue is Door =>
  doorSet.has(cellValue);

const encoder = new TextEncoder();

export const writeResultsTo = (
  strings: string,
  filename: string,
  create = true
) => {
  if (create) {
    Deno.writeTextFileSync(filename, "", { create: true });
  }

  const file = Deno.openSync(filename, {
    write: true,
    create,
    append: !create,
  });

  Deno.writeSync(file.rid, encoder.encode(strings));

  file.close();
};
