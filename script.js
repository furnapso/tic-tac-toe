const userInterface = (() => {
    const turnIdentifier = document.querySelector(".turn-identifier");

    const updateTurnIdentifier = () => {
        const turnIdenfierImage = turnIdentifier.querySelector("img")
        const currentTurnImage = turnIdenfierImage["src"].split("/").slice(-1);
        const newTurnImage = gameBoard.getCurrentTurn() + ".svg";
        const newTurnImageUrl = "images/" + newTurnImage;

        turnIdenfierImage["src"] = newTurnImageUrl;
    }

    document.querySelector('#reset').addEventListener("click", event => {
        gameBoard.resetGame();
        updateTurnIdentifier();
    })

    return {
        updateTurnIdentifier
    }
})();

const gameBoard = (() => {
    let board = [
        ["","",""],
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
                let boardValue = board[y][x];
                let square = squares[convertFromCoordinates([y, x])];
                let classList = Array.from(square.classList);

                if (boardValue == "") {
                    ["cross", "naught"].forEach(icon => {
                        if (classList.includes(icon)) {
                            square.classList.toggle(icon);
                        }
                    })
                }

                else square.classList.toggle(boardValue);
            }
        }
    }

    let currentTurn = "cross";

    const toggleTurn = () => {
        currentTurn = (currentTurn == "cross") ? "naught" : "cross";
        userInterface.updateTurnIdentifier();
    }

    const evaluateWins = () => {
        // Horizontal wins
        board.forEach(row => {
            if (row.every(val => (val === row[0] && row[0] != ""))) return row[0]
        })

        // Vertical wins
        for (let i = 0; i < board[0].length; i++) {
            if (board[0][i] == board[1][i] && board[0][i] == board[2][i] && board[0][i] != "") return board[0][i]
        }

        // Diagonal wins
        // Left diagonal
        let leftDiagonalCoordinates = [];
        let leftDiagonalResults = [];

        for (let i = 0; i < board[0].length; i++) {
            leftDiagonalCoordinates.push([i, i]);
        }
        
        leftDiagonalCoordinates.forEach(coord => {
            leftDiagonalResults.push(board[coord[0]][coord[1]]);
        })

        if (leftDiagonalResults.every(val => (val === leftDiagonalResults[0] && leftDiagonalResults[0] != ""))) {
            return leftDiagonalResults[0]
        }

        // Right diagonal
        let rightDiagonalCoordinates = [];
        let rightDiagonalResults = [];

        for (let i = 0, j = board[0].length; i < board[0].length; i++, j--) {
            rightDiagonalCoordinates.push(
                [i, j - 1]
            )
        }

        rightDiagonalCoordinates.forEach(coord => {
            rightDiagonalResults.push(board[coord[0]][coord[1]]);
        })

        if (rightDiagonalResults.every(val => (val === rightDiagonalResults[0] && rightDiagonalResults[0] != ""))) {
            return rightDiagonalResults[0]
        }
    }

    const clearBoard = () => {
        board = [
            ["","",""],
            ["","",""],
            ["","",""]
        ];

        drawBoard();
    }

    const resetGame = () => {
        clearBoard();
        currentTurn = "cross";
    }

    const getCurrentTurn = () => {
        return currentTurn;
    }

    squares.forEach(square => {
        square.addEventListener('click', (event) => {
            event.target.classList.toggle(currentTurn);

            let index = Array.from(squares).indexOf(event.target);
            let [y, x] = convertToCoordinates(index);

            if (board[y][x] != "") {
                // TODO: Throw error for clicking on existing space
            }
            else board[y][x] = currentTurn;

            if (evaluateWins() != undefined) {
                clearBoard();
            }

            toggleTurn();
        })
    })

    return {
        drawBoard, evaluateWins, clearBoard, resetGame, getCurrentTurn
    }
})();