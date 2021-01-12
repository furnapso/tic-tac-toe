function toProperCase(string) {
    let strSplit = string.toLowerCase().split(" ");
    for (let i = 0; i < strSplit.length; i++) {
        strSplit[i] = strSplit[i].charAt(0).toUpperCase() + strSplit[i].slice(1);
    }
    
    return strSplit.join(" ");
}

const userInterface = (() => {
    const turnIdentifier = document.querySelector(".turn-identifier");
    const gameType = document.querySelector(".game-type");
    
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
    
    const changeGameType = (newGameType) => {
        const currentGameType = gameType.textContent;
        if (newGameType == undefined) {
            gameType.textContent = currentGameType == "Player vs. Player" ? "Player vs. AI" : "Player vs. Player";
        }
        else {
            gameType.textContent = newGameType;
        }
        
        gameBoard.resetGame();
    }
    
    document.querySelector('#reset').addEventListener("click", event => {
        gameBoard.resetGame();
        updateTurnIdentifier();
    })
    
    document.querySelector("#change-game-type").addEventListener('click', event => {
        changeGameType();
        gameBoard.toggleAi();
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
    
    let aiIsPlaying = false;
    
    const toggleAi = (bool) => {
        bool = (bool || !aiIsPlaying);
        
        aiIsPlaying = bool;
    }
    
    const getBoard = () => JSON.parse(JSON.stringify(board));
    
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
            drawBoard, evaluateWinner, clearBoard, resetGame, getCurrentTurn, getBoard, convertFromCoordinates, toggleAi
        }
    })();
    
const aiPlayer = (() => {
    const game = gameBoard;
    let playing = false;
    
    const getAvailableMoves = (board) => {
        board = (board || gameBoard.getBoard());
        
        let availableMoves = [];
        
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board.length; x++) {
                if (board[y][x] == "") availableMoves.push([y, x]);
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
        let board = Array.from(gameBoard.getBoard());
        let move = bestMove(board);
        let index = gameBoard.convertFromCoordinates(move);
        
        setTimeout(() => {
            document.querySelectorAll(".square")[index].click()
        }, 300);
    }
    
    const miniMaxWinnerScores = {
        'naught': 1,
        'cross': -1,
        'Tie': 0
    }
    
    const miniMax = (board, depth, isMaximizing) => {
        let winner = gameBoard.evaluateWinner(board);

        if (winner != undefined) {
            return miniMaxWinnerScores[winner];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            let moves = getAvailableMoves(board);
            moves.forEach(move => {
                let [y, x] = move;
                const newBoard = Array.from(board);
                newBoard[y][x] = "cross";
                let score = miniMax(newBoard, depth + 1, false);
                bestScore = Math.max(score, bestScore);
            })

            return bestScore
        }

        else {
            let bestScore = Infinity;
            let moves = getAvailableMoves(board);
            moves.forEach(move => {
                let [y, x] = move;
                const newBoard = Array.from(board);
                newBoard[y][x] = "naught";
                let score = miniMax(newBoard, depth + 1, true);
                bestScore = Math.min(score, bestScore);
            })

            return bestScore;
        }
    }
    
    const bestMove = (board) => {
        let bestScore = -Infinity;
        let bestMove;
        let moves = getAvailableMoves(board);

        moves.forEach(move => {
            let [y, x] = move;
            const newBoard = Array.from(board);
            console.log("Original board")
            console.table(newBoard);
            newBoard[y][x] = "naught";
            console.log("Proposed next move")
            console.table(newBoard);
            // let score = miniMax(board, depth + 1, (maximizingPlayer ? false : true), (player == "cross" ? "naught" : "cross"));
            let score = miniMax(newBoard, 0, true);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        return bestMove;
    }
    
    return {
        getAvailableMoves, play, bestMove
    }
})();