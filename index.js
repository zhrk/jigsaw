// В этом файле ничего изменять не нужно, да и запрещено
// Вам нужен файл solution.js

function appendImageStyleForBlock(img) {
  const style = document.createElement("style");
  style.innerHTML = `
    .block { background-image: url("${img}"); }
  `;
  document.body.appendChild(style);
}

const GAP = 20;

function randomizeLocation({ container, restricted, size }) {
  const spaceX = container.clientWidth - size - 2 * GAP;
  const spaceY = container.clientHeight - size - 2 * GAP;

  let x = Math.floor(Math.random() * spaceX) + GAP;
  let y = Math.floor(Math.random() * spaceY) + GAP;

  return x > restricted.offsetLeft - size - GAP &&
    x < restricted.offsetLeft + restricted.clientWidth + GAP &&
    y > restricted.offsetTop - size - GAP &&
    y < restricted.offsetTop + restricted.clientHeight + GAP
    ? randomizeLocation({ container, restricted, size })
    : { x, y };
}

function getRandomTranslate({ container, restricted, size }) {
  const { x, y } = randomizeLocation({ container, restricted, size });

  return `translate(${x}px, ${y}px) rotate(${(Math.random() * 360).toFixed(
    0
  )}deg)`;
}

function assert(p, message) {
  if (!p()) {
    alert(message);
    throw new Error(message);
  }
}

const rows = 10;
const cols = 10;
const size = 50;

const $container = document.querySelector(".container");
const $solution = document.querySelector(".solution");
const $loading = document.querySelector(".loading");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fragment = document.createDocumentFragment();
const targets = [];
for (let i = 0; i < rows; i++) {
  targets[i] = [];
  for (let j = 0; j < cols; j++) {
    const pos = document.createElement("div");
    pos.className = "solution-block";
    pos.textContent = i * cols + j + 1;
    targets[i][j] = pos;
    fragment.appendChild(pos);
  }
}

document.querySelector(".solution").appendChild(fragment);

async function loadPuzzle() {
  return fetch("http://puzzle-task.t.javascript.ninja/pic").then((r) => r.json());
}

loadPuzzle()
  .then((response) => {
    const src = response.pic;
    const img = new Image();
    img.src = src;
    return new Promise((resolve) =>
      img.addEventListener("load", () => {
        appendImageStyleForBlock(src);
        $loading.remove();
        resolve(response.puzzle);
      })
    );
  })
  .then((puzzle) => {
    const pieces = {};

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    Object.assign(svg.style, { width: 0, height: 0 });
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(svg);

    puzzle.forEach((piece) => {
      const target = targets[piece.meta.i][piece.meta.j];

      defs.innerHTML += `<clipPath id="path-piece-${piece.id}"><path d="${piece.meta.path}" /></clipPath>`;

      const block = document.createElement("div");
      block.className = "block";
      Object.assign(block.style, {
        clipPath: `url(#path-piece-${piece.id})`,
        backgroundPositionX: `${-size * piece.meta.j + GAP}px`,
        backgroundPositionY: `${-size * piece.meta.i + GAP}px`,
        transform: `translate(${target.offsetLeft}px, ${target.offsetTop}px)`,
        zIndex: piece.meta.i * cols + piece.meta.j,
      });
      fragment.appendChild(block);

      pieces[piece.id] = {
        node: block,
        piece,
      };
    });

    $container.appendChild(fragment);

    Object.values(pieces).forEach(async (piece, idx) => {
      await sleep(10 * idx);
      piece.node.style.transform = getRandomTranslate({
        container: $container,
        restricted: $solution,
        size,
      });
    });

    $solution.addEventListener("click", async () => {
      const solution = window.solvePuzzle(
        puzzle.map(({ id, edges }) => ({ id, edges }))
      );

      assert(() => Array.isArray(solution), "Решение должно быть массивом");
      assert(
        () => solution.length <= 100,
        "Решение не может содержать более 100 элементов"
      );
      assert(
        () => solution.every((x) => typeof x === "number") <= 100,
        "Элементы решения должны быть ID фрагментов паззла"
      );
      assert(
        () => solution.every((x) => typeof pieces[x] !== "undefined") <= 100,
        "Один из элементов решения - несуществующий ID фрагмента"
      );

      const targets = document.querySelectorAll(".solution-block");

      solution.forEach(async (id, idx) => {
        await sleep(30 * idx);
        pieces[
          id
        ].node.style.transform = `translate(${targets[idx].offsetLeft}px, ${targets[idx].offsetTop}px)`;
      });
    });
  });
