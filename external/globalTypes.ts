declare type GridNode = {
  x: number;
  y: number;
  weight: number;
  parent?: GridNode;
  isWall(): boolean;
  getCost(): number;
  toString(): string;
}

declare class Graph {
  constructor(data: number[][]);
  grid: GridNode[][];
}

type Astar = {
  search: (graph: Graph, start: GridNode, end: GridNode) => GridNode[];
};

declare var astar: Astar;

