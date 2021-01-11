function toProperCase(string) {
    let strSplit = string.toLowerCase().split(" ");
    for (let i = 0; i < strSplit.length; i++) {
        strSplit[i] = strSplit[i].charAt(0).toUpperCase() + strSplit[i].slice(1);
    }

    return strSplit.join(" ");
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const userInterface = (() => {
    const turnIdentifier = document.querySelector(".turn-identifier");

    const updateTurnIdentifier = () => {
        const turnIdenfierImage = turnIdentifier.querySelector("img")
        const currentTurnImage = turnIdenfierImage["src"].split("/").slice(-1);
        const newTurnImage = gameBoard.getCurrentTurn() + ".svg";
        const newTurnImageUrl = "images/" + newTurnImage;

        turnIdenfierImage["src"] = newTurnImageUrl;
    }

    const showMessage = (message, isError) => {
        const messageDiv = document.querySelector("p.message");
        messageDiv.textContent = message;

        let messageClass = (isError != undefined && isError) ? "error-active" : "message-active";

        messageDiv.classList.add(messageClass);
        setTimeout(() => {
            messageDiv.classList.remove(messageClass);
            setTimeout(() => {
                messageDiv.textContent = "";
            }, 200)
        }, 4000)
    }

    document.querySelector('#reset').addEventListener("click", event => {
        gameBoard.resetGame();
        updateTurnIdentifier();
    })

    return {
        updateTurnIdentifier, showMessage
    }
})();

const gameBoard = (() => {
    let board = [
        ["","",""],
        ["","",""],
        ["","",""]
    ];

    let aiIsPlaying = true;

    const getBoard = () => board

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

    const updateTurn = (newTurn) => {
        if (newTurn == undefined) {
            currentTurn = (currentTurn == "cross") ? "naught" : "cross";
        }

        else if (["cross", "naught"].includes(newTurn)) currentTurn = newTurn;
        
        userInterface.updateTurnIdentifier();
    }

    const evaluateWinner = (currentBoard) => {
        currentBoard = (currentBoard || board);

        // Horizontal wins
        for (let i = 0; i <currentBoard[0].length; i++) {
            if (currentBoard[i].every(val => val == currentBoard[i][0] && currentBoard[i][0] != "")) return currentBoard[i][0];
        }

        // Vertical wins
        for (let i = 0; i < currentBoard[0].length; i++) {
            if (currentBoard[0][i] == currentBoard[1][i] && currentBoard[0][i] == currentBoard[2][i] && currentBoard[0][i] != "") return currentBoard[0][i]
        }

        // Diagonal wins
        // Left diagonal
        let leftDiagonalCoordinates = [];
        let leftDiagonalResults = [];

        for (let i = 0; i < currentBoard[0].length; i++) {
            leftDiagonalCoordinates.push([i, i]);
        }
        
        leftDiagonalCoordinates.forEach(coord => {
            leftDiagonalResults.push(currentBoard[coord[0]][coord[1]]);
        })

        if (leftDiagonalResults.every(val => (val === leftDiagonalResults[0] && leftDiagonalResults[0] != ""))) {
            return leftDiagonalResults[0]
        }

        // Right diagonal
        let rightDiagonalCoordinates = [];
        let rightDiagonalResults = [];

        for (let i = 0, j = currentBoard[0].length; i < currentBoard[0].length; i++, j--) {
            rightDiagonalCoordinates.push(
                [i, j - 1]
            )
        }

        rightDiagonalCoordinates.forEach(coord => {
            rightDiagonalResults.push(currentBoard[coord[0]][coord[1]]);
        })

        if (rightDiagonalResults.every(val => (val === rightDiagonalResults[0] && rightDiagonalResults[0] != ""))) {
            return rightDiagonalResults[0]
        }

        // Tie
        if (currentBoard.every(row => {
            return row.every(square => {
                return square != "";
            })
        })) {
            return "Tie";
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
        updateTurn("cross");
    }

    const getCurrentTurn = () => {
        return currentTurn;
    }

    // Square click event
    squares.forEach(square => {
        square.addEventListener('click', (event) => {
            let index = Array.from(squares).indexOf(event.target);
            let [y, x] = convertToCoordinates(index);

            if (board[y][x] != "") {
                userInterface.showMessage("Invalid selection", true);
            }
            else {
                board[y][x] = currentTurn;
                event.target.classList.toggle(currentTurn);
                updateTurn();
            }
            
            const winner = evaluateWinner();

            if (winner != undefined) {
                if (winner == "Tie") userInterface.showMessage(`It's a tie!`);

                else userInterface.showMessage(`${toProperCase(winner)} has won!`);

                resetGame();
            }

            if (aiIsPlaying && currentTurn == "naught") aiPlayer.play();
        })
    })

    return {
        drawBoard, evaluateWinner, clearBoard, resetGame, getCurrentTurn, getBoard, convertFromCoordinates
    }
})();

const aiPlayer = (() => {
    const game = gameBoard;
    let playing = false;
    
    const getAvailableMoves = (board) => {
        board = (board || gameBoard.getBoard());

        let availableMoves = [];

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j] == "") availableMoves.push([i, j]);
            }
        }

        return availableMoves;
    }

    const getRandomMove = (board) => {
        board = (board || gameBoard.getBoard());

        const moves = getAvailableMoves();

        return moves[Math.floor(Math.random() * (moves.length - 1))];
    }

    const play = () => {
        let move = getRandomMove();
        let index = gameBoard.convertFromCoordinates(move);

        setTimeout(() => {
            document.querySelectorAll(".square")[index].click()
        }, 300);
    }

    return {
        getAvailableMoves, play
    }
})();