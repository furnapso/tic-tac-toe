const gameBoard = (() => {
    let board = [
        ["naught","",""],
        ["","",""],
        ["","",""]
    ];

    const squares = document.querySelectorAll(".square");

    const convertCoordinates = (coordinates) => {
        return board[0].length * coordinates[0] + coordinates[1];
    }

    const drawBoard = () => {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                squares[convertCoordinates([y, x])].classList.toggle(board[y][x]);
            }
        }
    }

    return {
        drawBoard
    }
})();

gameBoard.drawBoard();