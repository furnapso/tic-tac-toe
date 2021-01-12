function toProperCase(str) {
    const strSplit = str.toLowerCase().split(" ");
    for (let i = 0; i < strSplit.length; i += 1) {
        strSplit[i] = strSplit[i].charAt(0).toUpperCase() + strSplit[i].slice(1);
    }
    
    return strSplit.join(" ");
}

const userInterface = (() => {
    const turnIdentifier = document.querySelector(".turn-identifier");
    const gameType = document.querySelector(".game-type");
    
    const updateTurnIdentifier = () => {
        const turnIdenfierImage = turnIdentifier.querySelector("img");
        // const currentTurnImage = turnIdenfierImage.src.split("/").slice(-1);
        const newTurnImage = `${gameBoard.getCurrentTurn()}.svg`;
        const newTurnImageUrl = `images/${newTurnImage}`;
        
        turnIdenfierImage.src = newTurnImageUrl;
    };
    
    const showMessage = (message, isError) => {
        const messageDiv = document.querySelector("p.message");
        messageDiv.textContent = message;
        
        const messageClass = isError ? "error-active" : "message-active";
        
        messageDiv.classList.add(messageClass);
        setTimeout(() => {
            messageDiv.classList.remove(messageClass);
            setTimeout(() => {
                messageDiv.textContent = "";
            }, 200);
        }, 4000);
    };
    
    const changeGameType = (newGameType) => {
        const currentGameType = gameType.textContent;
        if (!newGameType) {
            gameType.textContent =
            currentGameType === "Player vs. Player" ? "Player vs. AI" : "Player vs. Player";
        } else {
            gameType.textContent = newGameType;
        }
        
        gameBoard.resetGame();
    };
    
    document.querySelector("#reset").addEventListener("click", (event) => {
        gameBoard.resetGame();
        updateTurnIdentifier();
    });
    
    document.querySelector("#change-game-type").addEventListener("click", (event) => {
        changeGameType();
        gameBoard.toggleAi();
    });
    
    return {
        updateTurnIdentifier,
        showMessage,
    };
})();

const aiPlayer = (() => {
    const getAvailableMoves = (board) => {
        const availableMoves = [];
        
        for (let y = 0; y < board.length; y += 1) {
            for (let x = 0; x < board.length; x += 1) {
                if (!board[y][x]) {
                    availableMoves.push([y, x]);
                }
            }
        }
        
        return availableMoves;
    };
    
    const play = () => {
        const board = gameBoard.getBoard();
        const move = bestMove(board);
        const index = gameBoard.convertFromCoordinates(move);
        
        setTimeout(() => {
            document.querySelectorAll(".square")[index].click();
        }, 300);
    };
    
    const miniMaxWinnerScores = {
        naught: 1,
        cross: -1,
        Tie: 0,
    };
    
    const miniMax = (board, depth, max = true) => {
        const winner = gameBoard.evaluateWinner(board);
        
        if (winner) {
            return miniMaxWinnerScores[winner];
        }
        
        const possibleMoves = getAvailableMoves(board);
        
        let bestScore = max ? -10 : 10;
        const fn = max ? Math.max : Math.min;
        const item = max ? "cross" : "naught";
        
        possibleMoves.forEach((move) => {
            const [y, x] = move;
            const newBoard = JSON.parse(JSON.stringify(board));
            newBoard[y][x] = item;
            const score = miniMax(newBoard, depth + 1, !max);
            bestScore = fn(score, bestScore);
        });
        
        return bestScore;
    };
    
    const bestMove = (board) => {
        let bestScore = -Infinity;
        let bestMoveXY;
        const moves = getAvailableMoves(board);
        
        moves.forEach((move) => {
            const [y, x] = move;
            const newBoard = JSON.parse(JSON.stringify(board));
            
            newBoard[y][x] = "naught";
            
            const score = miniMax(newBoard, 0);
            
            if (score > bestScore) {
                bestScore = score;
                bestMoveXY = move;
            }
        });
        
        return bestMoveXY;
    };
    
    return {
        getAvailableMoves,
        play,
        bestMove,
    };
})();

const gameBoard = (() => {
    let board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ];
    
    let aiIsPlaying = false;
    
    const toggleAi = (bool) => {
        aiIsPlaying = bool || !aiIsPlaying;
    };
    
    const getBoard = () => JSON.parse(JSON.stringify(board));
    
    const squares = document.querySelectorAll(".square");
    
    const convertFromCoordinates = ([y, x]) => board[0].length * y + x;
    
    const convertToCoordinates = (index) => [
        Math.floor(index / board[0].length),
        index % board[0].length,
    ];
    
    const drawBoard = () => {
        for (let y = 0; y < board.length; y += 1) {
            for (let x = 0; x < board[y].length; x += 1) {
                const boardValue = board[y][x];
                const square = squares[convertFromCoordinates([y, x])];
                const classList = Array.from(square.classList);
                
                if (boardValue === "") {
                    ["cross", "naught"].forEach((icon) => {
                        if (classList.includes(icon)) {
                            square.classList.toggle(icon);
                        }
                    });
                } else {
                    square.classList.toggle(boardValue);
                }
            }
        }
    };
    
    let currentTurn = "cross";
    
    const updateTurn = (newTurn) => {
        if (!newTurn) {
            currentTurn = currentTurn === "cross" ? "naught" : "cross";
        } else if (["cross", "naught"].includes(newTurn)) {
            currentTurn = newTurn;
        }
        
        userInterface.updateTurnIdentifier();
    };
    
    const evaluateWinner = (currentBoard = board) => {
        // Horizontal wins
        for (let i = 0; i < currentBoard[0].length; i += 1) {
            if (currentBoard[i].every((val) => val === currentBoard[i][0] && currentBoard[i][0])) {
                return currentBoard[i][0];
            }
        }
        
        // Vertical wins
        const verticalWin = currentBoard[0].find(
            (item, i) => item && item === currentBoard[1][i] && item === currentBoard[2][i],
            );
            
            if (verticalWin) {
                return verticalWin;
            }
            
            // Diagonal wins
            // Left diagonal
            const leftDiagonalCoordinates = [];
            const leftDiagonalResults = [];
            
            for (let i = 0; i < currentBoard[0].length; i += 1) {
                leftDiagonalCoordinates.push([i, i]);
            }
            
            leftDiagonalCoordinates.forEach((coord) => {
                leftDiagonalResults.push(currentBoard[coord[0]][coord[1]]);
            });
            
            if (
                leftDiagonalResults.every(
                    (val) => val === leftDiagonalResults[0] && leftDiagonalResults[0] !== "",
                    )
                    ) {
                        return leftDiagonalResults[0];
                    }
                    
                    // Right diagonal
                    const rightDiagonalCoordinates = [];
                    const rightDiagonalResults = [];
                    
                    for (let i = 0, j = currentBoard[0].length; i < currentBoard[0].length; i += 1, j -= 1) {
                        rightDiagonalCoordinates.push([i, j - 1]);
                    }
                    
                    rightDiagonalCoordinates.forEach((coord) => {
                        rightDiagonalResults.push(currentBoard[coord[0]][coord[1]]);
                    });
                    
                    if (
                        rightDiagonalResults.every(
                            (val) => val === rightDiagonalResults[0] && rightDiagonalResults[0] !== "",
                            )
                            ) {
                                return rightDiagonalResults[0];
                            }
                            
                            // Tie
                            if (currentBoard.every((row) => row.every((square) => square !== ""))) {
                                return "Tie";
                            }
                            
                            return false;
                        };
                        
                        const clearBoard = () => {
                            board = [
                                ["", "", ""],
                                ["", "", ""],
                                ["", "", ""],
                            ];
                            
                            drawBoard();
                        };
                        
                        const resetGame = () => {
                            clearBoard();
                            updateTurn("cross");
                        };
                        
                        const getCurrentTurn = () => currentTurn;
                        
                        // Square click event
                        squares.forEach((square) => {
                            square.addEventListener("click", (event) => {
                                const index = Array.from(squares).indexOf(event.target);
                                const [y, x] = convertToCoordinates(index);
                                
                                if (board[y][x] !== "") {
                                    userInterface.showMessage("Invalid selection", true);
                                } else {
                                    board[y][x] = currentTurn;
                                    event.target.classList.toggle(currentTurn);
                                    updateTurn();
                                }
                                
                                const winner = evaluateWinner();
                                
                                if (winner) {
                                    if (winner === "Tie") {
                                        userInterface.showMessage(`It's a tie!`);
                                    } else {
                                        userInterface.showMessage(`${toProperCase(winner)} has won!`);
                                    }
                                    
                                    resetGame();
                                }
                                
                                if (aiIsPlaying && currentTurn === "naught") {
                                    aiPlayer.play();
                                }
                            });
                        });
                        
                        return {
                            drawBoard,
                            evaluateWinner,
                            clearBoard,
                            resetGame,
                            getCurrentTurn,
                            getBoard,
                            convertFromCoordinates,
                            toggleAi,
                        };
                    })();
                    