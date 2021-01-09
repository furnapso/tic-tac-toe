const gameBoard = (() => {
    let board = [
        ["naught","",""],
        ["","",""],
        ["","",""]
    ];

    const squares = document.querySelectorAll(".square");

    const convertFromCoordinates = (coordinates) => {
        return board[0].length * coordinates[0] + coordinates[1];
    }

    const convertToCoordinates = (index) => {
        return [
            Math.floor(index / board[0].length),
            index % board[0].length
        ]
    }

    const drawBoard = () => {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                squares[convertFromCoordinates([y, x])].classList.toggle(board[y][x]);
            }
        }
    }

    squares.forEach(square => {
        square.addEventListener('click', (event) => {
            // TODO: Add board update logic
            console.log(Array.from(squares).indexOf(event.target));
        })
    })

    return {
        drawBoard
    }
})();