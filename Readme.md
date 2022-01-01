# Maze solver

To solve the task I used A* algorithm to find optimal path inside the maze.

## Solving the maze

The idea is quite simple:
Before working with maze let's assume that closed doors are walls and the exit is a wall too (because we don't want to leave the maze before we get all the items).

1) Scan the maze from the current position to get the list of reachable items (treasures and keys)
2) Find the closest reachable item
3) Go to it and collect (In case of key we need to replace door-wall to empty cell to consider it opened)
4) Go to #1

At the end if there are no reachable keys or treasures, reveal exit and leave the maze

## Converting to Xennial

**OMG I didn't expect that it is so difficult**

We got steps from solving algorithm. Now we need to encode it to Xennial code.

1) We need to compress the results (for instance we don't need to copy the same string again, instead we need to make a loop and iterate through it)

2) Xennial program needs to be rerun every time we make a move, so using *FOR* loop is not our case, we'll emulate it with variables stored in memory (CX = currentX, EX = endX)

```
POKE c,CX+1:POKE e,10:POKE 0,0:RETURN
```

3) Each time we run the program we need to skip completed steps, so we need to keep the number of line we need to go to. As the maximum allowed number to store is 255, we can encode our line number into two variables and then compute original number: 

```
GOTO 3050+256*PEEK(li_1)+PEEK(li_0)
```

4) When we complete the line we need to increase line counters

```
6000 REM inc li
6001 IF PEEK(li_0)+1 < 256 THEN
6002   POKE li_0,PEEK(li_0)+1
6003 ELSE
6004   POKE li_0,0
6005   POKE li_1,PEEK(li_1)+1
6006 END IF
6007 RETURN
```

5) That's all folks!