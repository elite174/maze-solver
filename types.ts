export type Entity = "#" | "." | "$" | "<" | ">";
export type Key = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" ;
export type Door = Uppercase<Key>;
export type CellValue = Entity | Key | Door;
