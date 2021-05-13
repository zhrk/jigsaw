function solvePuzzle(pieces) {
  const rotatePuzzle = (puzzle) => {
    const edges = Object.keys(puzzle.edges).reduce((acc, curr, index) => {
      const arrayIndex =
        index === Object.values(puzzle.edges).length - 1 ? 0 : index + 1;

      acc[curr] = Object.values(puzzle.edges)[arrayIndex];

      return acc;
    }, {});

    return {
      ...puzzle,
      edges,
    };
  };

  let firstInputPuzzle = pieces[0];

  while (!(!firstInputPuzzle.edges.top && !firstInputPuzzle.edges.left)) {
    firstInputPuzzle = rotatePuzzle(firstInputPuzzle);
  }

  let restPuzzles = pieces.filter((item) => item.id !== firstInputPuzzle.id);

  let rowPuzzles = [firstInputPuzzle];
  let puzzles = [];

  const findPuzzleIdByEdgeTypeId = (edgeTypeId, puzzle) => {
    const edgeIds = Object.values(puzzle.edges).find(
      (item) => item?.edgeTypeId === edgeTypeId
    );

    return edgeIds;
  };

  const rotatePuzzleByEdgeTypeId = (edgeTypeId, puzzle) => {
    let rotatedPuzzle = puzzle;

    while (rotatedPuzzle.edges.left?.edgeTypeId !== edgeTypeId) {
      rotatedPuzzle = rotatePuzzle(rotatedPuzzle);
    }

    return rotatedPuzzle;
  };

  const rotatePuzzleByEdgeTypeIdOnBottom = (edgeTypeId, puzzle) => {
    let rotatedPuzzle = puzzle;

    while (rotatedPuzzle.edges.top?.edgeTypeId !== edgeTypeId) {
      rotatedPuzzle = rotatePuzzle(rotatedPuzzle);
    }

    return rotatedPuzzle;
  };

  while (puzzles.length !== pieces.length) {
    rowPuzzles.forEach((puzzle) => {
      if (!puzzle.edges.right) {
        const rowFirstPuzzleBottomEdge =
          rowPuzzles[0]?.edges?.bottom?.edgeTypeId;

        const bottomPuzzle = restPuzzles.find((item) =>
          findPuzzleIdByEdgeTypeId(rowFirstPuzzleBottomEdge, item)
        );

        puzzles = [...puzzles, ...rowPuzzles];

        const isExists =
          rowFirstPuzzleBottomEdge === 0 ? true : rowFirstPuzzleBottomEdge;

        if (isExists) {
          rowPuzzles = [
            rotatePuzzleByEdgeTypeIdOnBottom(
              rowFirstPuzzleBottomEdge,
              bottomPuzzle
            ),
          ];

          restPuzzles = restPuzzles.filter(
            (item) => item.id !== bottomPuzzle.id
          );
        }
      }

      if (
        puzzle.edges.right &&
        rowPuzzles.map((item) => item.id).includes(puzzle.id)
      ) {
        const { edgeTypeId } = puzzle.edges.right;

        const rightPuzzle = restPuzzles.find((item) =>
          findPuzzleIdByEdgeTypeId(edgeTypeId, item)
        );

        if (rightPuzzle) {
          rowPuzzles.push(rotatePuzzleByEdgeTypeId(edgeTypeId, rightPuzzle));

          restPuzzles = restPuzzles.filter(
            (item) => item.id !== rightPuzzle.id
          );
        }
      }
    });
  }

  return puzzles.map((item) => item.id);
}

// Не удаляйте эту строку
window.solvePuzzle = solvePuzzle;
