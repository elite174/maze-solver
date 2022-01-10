# Maze solver

For this task I used Deno (because I love to play with new stuff :) ).

To solve the task I used A* algorithm to find optimal path inside the maze.

## Solving the maze

The idea is quite simple:
Before working with maze let's assume that closed doors are walls and the exit is a wall too (because we don't want to leave the maze before we get all the items).

1) Scan the maze from the current position to get the list of reachable items (treasures and keys)
~~2) Find the closest reachable item
~3) Go to it and collect (In case of key we need to replace door-wall to empty cell to consider it opened)
~4) Go to #1~~

I added some heuristics and discovered that we need to prioritize finding keys first and also collect items (keys and treasures) in the visible area.

At the end if there are no reachable keys or treasures, reveal exit and leave the maze

## Converting to Xennial

**OMG I didn't expect that it is so difficult**

We got steps from solving algorithm. Now we need to encode it to Xennial code.

1) We need to compress the results (for instance we don't need to copy the same string again, instead we need to make a loop and iterate through it)

2) Xennial program needs to be rerun every time we make a move, so using *FOR* loop is not our case, we'll emulate it with variables stored in memory (CX = currentX, EX = endX).

`${this.currentLineNumber++} POKE ${endOffset},${stepsCount}:POKE 0,${direction}:RETURN`

3) Each time we run the program we need to skip completed steps, so we need to keep the number of line we need to go to. As the maximum allowed number to store is 255, we can encode our line number into two variables and then compute original number: 

```
GOTO 3050+256*PEEK(li_1)+PEEK(li_0)
```

4) When we complete the line we need to increase line counters

```
6001 IF LI_0+1 < 256 THEN
6002   POKE ${li0Offset},LI_0+1
6003 ELSE
6004   POKE ${li0Offset},0
6005   POKE ${li1Offset},PEEK(${li1Offset})+1
6006 END IF
6007 RETURN
```

5) That's all folks!
