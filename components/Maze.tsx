"use client";

import { useEffect, useState } from "react";
import Style from "./Maze.module.css";

const MazeGrid = () => {
  const initialMaze = [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "start", "path", "path", "wall"],
    ["wall", "wall", "wall", "path", "wall"],
    ["wall", "wall", "wall", "path", "end"],
  ];

  const [mazeGrid, setMazeGrid] = useState(initialMaze);
  // const [isGeneratingMaze, setIsGeneratingMaze] = useState(false);
  const [isSolvingMaze, setIsSolvingMaze] = useState(false);
  const [isMazeSolved, setIsMazeSolved] = useState(false);
  // const [isMazePathFound, setIsMazePathFound] = useState(false);
  const [algorithm, setAlgorithm] = useState("bfs");

  const [timeoutSpeed, setTimeoutSpeed] = useState(300);

  useEffect(() => {
    generateMaze(15, 15);
  }, []);

  function generateMaze(width: number, height: number) {
    let matrix = [];

    for (let i = 0; i < width; i++) {
      let rows = [];
      for (let j = 0; j < height; j++) {
        rows.push("wall");
      }
      matrix.push(rows);
    }

    createRecursivePaths(1, 1, matrix);

    matrix[1][0] = "start";
    matrix[height - 2][width - 1] = "end";
    setMazeGrid(matrix);
  }

  function createRecursivePaths(x: number, y: number, matrix: string[][]) {
    matrix[x][y] = "path";

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ].sort(() => Math.random() - 0.5);

    for (let [dx, dy] of directions) {
      const newX = x + dx * 2;
      const newY = y + dy * 2;

      if (
        newX >= 0 &&
        newY >= 0 &&
        newX < matrix[0].length &&
        newY < matrix.length &&
        matrix[newX][newY] === "wall"
      ) {
        matrix[x + dx][y + dy] = "path";
        createRecursivePaths(newX, newY, matrix);
      }
    }
  }

  function bfs(startNode: [number, number]) {
    const queue = [startNode];
    const visited = new Set(`${startNode[0]},${startNode[1]}`);
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    let timeoutId: ReturnType<typeof setTimeout>;

    const updateMazeGrid = () => {
      const [x, y] = queue.shift()!;

      for (let [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (
          newX >= 0 &&
          newY >= 0 &&
          newX < mazeGrid[0].length &&
          newY < mazeGrid.length &&
          mazeGrid[newY][newX] !== "wall" &&
          !visited.has(`${newY},${newX}`)
        ) {
          visited.add(`${newY},${newX}`);
          if (
            mazeGrid[newY][newX] === "end" ||
            mazeGrid[newY][newX] === "path"
          ) {
            setMazeGrid((prev) =>
              prev.map((row, rowIndex) =>
                row.map((cell, cellIndex) => {
                  if (rowIndex === newY && cellIndex === newX) {
                    return cell === "end" ? "end" : "visited";
                  }
                  return cell;
                })
              )
            );

            if (mazeGrid[newY][newX] === "end") {
              clearTimeout(timeoutId);
              setIsSolvingMaze(false);
              setIsMazeSolved(true);
              return;
            }
            queue.push([newX, newY]);
          }
        }
      }

      if (queue.length > 0) {
        timeoutId = setTimeout(updateMazeGrid, timeoutSpeed);
      }
    };

    updateMazeGrid();
  }

  function dfs(startNode: [number, number]) {
    const stack: [number, number][] = [startNode];
    const visited = new Set<string>();
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    const updateMazeGrid = () => {
      const [x, y] = stack.pop()!;
      visited.add(`${x},${y}`);

      for (let [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;

        if (
          newX >= 0 &&
          newY >= 0 &&
          newX < mazeGrid.length &&
          newY < mazeGrid[0].length &&
          !visited.has(`${newX},${newY}`) &&
          mazeGrid[newY][newX] !== "wall"
        ) {
          visited.add(`${newX},${newY}`);
          if (
            mazeGrid[newY][newX] === "end" ||
            mazeGrid[newY][newX] === "path"
          ) {
            setMazeGrid((prev) =>
              prev.map((row, rowIndex) =>
                row.map((cell, cellIndex) => {
                  if (rowIndex === newY && cellIndex === newX) {
                    return cell === "end" ? "end" : "visited";
                  }
                  return cell;
                })
              )
            );

            if (mazeGrid[newY][newX] === "end") {
              clearTimeout(timeoutId);
              setIsSolvingMaze(false);
              setIsMazeSolved(true);
              return;
            }
            stack.push([newX, newY]);
          }
        }
      }

      if (stack.length > 0) {
        timeoutId = setTimeout(updateMazeGrid, timeoutSpeed);
      }
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    updateMazeGrid();
  }

  function resetAndGenerateMaze() {
    setIsSolvingMaze(false);
    setIsMazeSolved(false);
    generateMaze(15, 15);
  }

  function executeAlgorithm() {
    setIsSolvingMaze(true);
    setIsMazeSolved(false);
    switch (algorithm) {
      case "bfs":
        bfs([1, 0]);
        break;
      case "dfs":
        dfs([1, 0]);
        break;
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold p-6">
        Path-finding algorithms visualizer
      </h1>
      {mazeGrid.length === 4 ? (
        <progress className="progress w-56"></progress>
      ) : (
        <>
          {mazeGrid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-row">
              {row.map((type, typeIdx) => (
                <div
                  key={typeIdx}
                  className={`${Style.cell} ${Style[type]}`}
                ></div>
              ))}
            </div>
          ))}

          <div className="flex flex-col items-start justify-center gap-5 mt-10 w-full">
            <div className="form-control w-full">
              <label htmlFor="default-range" className="label cursor-pointer">
                Speed: {timeoutSpeed}ms
              </label>
              <input
                id="default-range"
                type="range"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                onChange={(e) => setTimeoutSpeed(parseInt(e.target.value))}
                min="100"
                max="500"
                disabled={isSolvingMaze}
              ></input>
            </div>
            <div className="flex items-center gap-5">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-3">
                    Breadth-first Search Algorithm
                  </span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-[#008000]"
                    checked={algorithm === "bfs"}
                    onChange={() => setAlgorithm("bfs")}
                    disabled={isSolvingMaze}
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-3">
                    Depth-first Search Algorithm
                  </span>
                  <input
                    type="radio"
                    name="radio-10"
                    value={"dfs"}
                    className="radio checked:bg-[#008000]"
                    onChange={() => setAlgorithm("dfs")}
                    disabled={isSolvingMaze}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-5">
            {isMazeSolved && (
              <button
                className="btn w-44 rounded-full mt-10"
                onClick={() => resetAndGenerateMaze()}
                disabled={isSolvingMaze}
              >
                <span>Reset</span>
              </button>
            )}
            {!isMazeSolved && (
              <button
                className="btn w-44 rounded-full mt-10"
                onClick={() => executeAlgorithm()}
                disabled={isSolvingMaze}
              >
                <span>Execute</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MazeGrid;
