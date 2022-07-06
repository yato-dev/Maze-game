let valueX = 8,
  valueY = 6; //default values
const front = document.querySelector(".front"); //front page
const start = document.querySelector(".start"); //start button

//making menu page
start.addEventListener("click", () => {
  front.classList.add("hidden");
  showMenu();
});

//creating menu
const showMenu = () => {
  const menu = document.createElement("div");
  menu.classList.add("show");
  menu.classList.add("Menu");

  //writing html
  menu.innerHTML = `  
  <h1 class="menu-heading">CHOOSE LEVEL</h1>
  <button class="easy">EASY</button>
  <button class="medium">MEDIUM</button>
  <button class="hard">Hard</button> `;

  document.querySelector(".append").append(menu);

  const easy = document.querySelector(".easy");
  const medium = document.querySelector(".medium");
  const hard = document.querySelector(".hard");

  easy.addEventListener("click", () => {
    valueX = 8;
    valueY = 6;
    document.querySelector(".append").classList.add("hidden");
    game(valueX, valueY);
  });
  medium.addEventListener("click", () => {
    valueX = 12;
    valueY = 8;
    document.querySelector(".append").classList.add("hidden");
    game(valueX, valueY);
  });
  hard.addEventListener("click", () => {
    valueX = 20;
    valueY = 15;
    document.querySelector(".append").classList.add("hidden");
    game(valueX, valueY);
  });
};

const game = (X, Y) => {
  //initialization
  const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
  const cellsHorizontal = X;
  const cellsVertical = Y;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const unitLengthX = width / cellsHorizontal;
  const unitLengthY = height / cellsVertical;

  //matter js
  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const { world } = engine;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: false,
      width,
      height,
    },
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);

  // Walls
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
  ];
  World.add(world, walls);

  // Maze generation
  const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  };

  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical); //randomizing row
  const startColumn = Math.floor(Math.random() * cellsHorizontal); //randominzing column

  const stepThroughCell = (row, column) => {
    // If i have visted the cell at [row, column], then return
    if (grid[row][column]) {
      return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
      [row - 1, column, "up"],
      [row, column + 1, "right"],
      [row + 1, column, "down"],
      [row, column - 1, "left"],
    ]);
    // For each neighbor....
    for (let neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;

      // See if that neighbor is out of bounds
      if (
        nextRow < 0 ||
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
      ) {
        continue;
      }

      // If we have visited that neighbor, continue to next neighbor
      if (grid[nextRow][nextColumn]) {
        continue;
      }

      // Remove a wall from either horizontals or verticals
      if (direction === "left") {
        verticals[row][column - 1] = true;
      } else if (direction === "right") {
        verticals[row][column] = true;
      } else if (direction === "up") {
        horizontals[row - 1][column] = true;
      } else if (direction === "down") {
        horizontals[row][column] = true;
      }

      stepThroughCell(nextRow, nextColumn);
    }
  };

  stepThroughCell(startRow, startColumn);

  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        5,
        {
          label: "wall",
          isStatic: true,
          render: {
            fillStyle: "red",
          },
        }
      );
      World.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        5,
        unitLengthY,
        {
          label: "wall",
          isStatic: true,
          render: {
            fillStyle: "red",
          },
        }
      );
      World.add(world, wall);
    });
  });

  // Goal

  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
      label: "goal",
      isStatic: true,
      render: {
        fillStyle: "green",
      },
    }
  );
  World.add(world, goal);

  // Ball

  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: "ball",
    render: {
      fillStyle: "blue",
    },
    // frictionAir: 0.04,
  });
  World.add(world, ball);

  document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;
    // console.log(event);
    if (event.key === "w") {
      Body.setVelocity(ball, { x, y: y - 4 });
      // console.log(ball.velocity.y);
    }
    // console.log(ball.velocity.x,ball.velocity.y);0;
    if (ball.velocity.y < -10) {
      Body.setVelocity(ball, { x, y: -4 });
      // console.log(ball.velocity.y);
    }
    // } //up

    if (event.key === "d") {
      Body.setVelocity(ball, { x: x + 4, y });
      // console.log(ball.velocity.x);
      if (ball.velocity.x > 10) {
        Body.setVelocity(ball, { x: 4, y });
        // console.log(ball.velocity.x);
      }
    } //right

    if (event.key === "s") {
      Body.setVelocity(ball, { x, y: y + 4 });
      // console.log(ball.velocity.y);
      if (ball.velocity.y > 10) {
        Body.setVelocity(ball, { x, y: 4});
        // console.log(ball.velocity.y);
      }
    } //down

    if (event.key === "a") {
      Body.setVelocity(ball, { x: x - 4, y });
      // console.log(ball.velocity.x);
      if (ball.velocity.x < -10) {
        Body.setVelocity(ball, { x: -4, y });
        // console.log(ball.velocity.x);
      }
    } //left
  });

  // Win Condition

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["ball", "goal"];

      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        world.gravity.y = 1;
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
          }
          document.querySelector("#success").classList.remove("hidden");
          const restart = document.querySelector(".restart");
          restart.addEventListener("click", () => {
            front.classList.remove("hidden");
            window.location.reload();
          });
        });
      }
    });
  });
};
console.log(valueX, valueY);
