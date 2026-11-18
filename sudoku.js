const sudoku =  (() => {
    let canvas;
    let c;
    let color = '#008F46';
    let availableWidth;
    let availableHeight;
    let cellSize;
    let boardSize;
    let offsetX;
    let offsetY;
    let selectedRow;
    let selectedCol;
    let gameWon;
    let gameOver;
    let attempts;
    let puzzle;

    let cellsNum = 81;
    let board;

    let shuffle = (arr) => {
        for(let i = arr.length - 1; i > 0; i--)
        {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    let solveBoard = (passedBoard) => {
        for(let i = 0; i < 81; i++)
        {
            if(passedBoard[i].value === '0')
            {
                let [row, col] = posOf(i);
                let digits = shuffle(['1','2','3','4','5','6','7','8','9']);

                for(let digit of digits)
                {
                    if(!isIllegal(digit, passedBoard, row, col))
                    {
                        passedBoard[i].value = digit;

                        if(solveBoard(passedBoard))
                            return true;

                        passedBoard[i].value = '0';
                    }
                }
                return false;
            }
        }
        return true;
    };

    let generatePuzzle = () => {
        let solvedBoard = setBoard('0'.repeat(81), 81);
        solveBoard(solvedBoard);

        let generatedPuzzle = solvedBoard.map(cell => cell.value);
        let positions = shuffle([...Array(81).keys()]);

        for(let i = 0; i < 50; i++)
        {
            generatedPuzzle[positions[i]] = '0';
        }

        return generatedPuzzle.join('');
    };

    let setBoard = (passedPuzzle, passedCellsNum) => {
        let arangedBoard = [];
        for(let i = 0; i < passedCellsNum; i++)
        {
            arangedBoard[i] = {'value': passedPuzzle[i], 'given': true};
            if(arangedBoard[i].value === '0') arangedBoard[i].given = false;
        }
        return arangedBoard;
    };

    //arr[0] is row and arr[1] is column
    let posOf = (index) => {
        if(index >= 81 || index < 0) return;
        return [Math.floor(index / 9), index % 9];
    };

    let indexOf = (row, col) => {
        return row * 9 + col;
    };

    //arr[0] is row and arr[1] is column
    let startBlockOf = (row, col) => {
        return [Math.floor(row / 3) * 3, Math.floor(col / 3) * 3]
    };

    let isGiven = (row, col, passedBoard) => {
        if(passedBoard[indexOf(row, col)].given === true)
            return true;
        return false;
    };

    let rowCheck = (digit, row, col,passedBoard) => {
        let index = indexOf(row, col);
        for(let i = indexOf(row, 0); i < indexOf(row, 0) + 9; i++)
        {
            if(i != index && passedBoard[i].value === digit)
                return true;
        }
        return false;
    };

    let columnCheck = (digit,row , col, passedBoard) => {
        let index = indexOf(row, col);
        for(let i = indexOf(0, col); i < passedBoard.length; i += 9)
        {
            if(i != index && passedBoard[i].value === digit)
                return true;
        }
        return false;
    };

    let blockCheck = (digit, passedBoard, row, col, orRow, orCol) => {
        let orIndex = indexOf(orRow, orCol);
        let index = indexOf(row, col);
        for(let i = 0; i < 3; i++)
        {
            if(index + i != orIndex && passedBoard[index + i].value === digit) return true;
            for(let j = 1; j < 3; j++)
            {
                if((index + i) + (j * 9) != orIndex && passedBoard[(index + i) + (j * 9)].value === digit) return true;
            }
        }
        return false;
    };

    let isIllegal = (digit, passedBoard, row, col) => {
        if(digit === '0') return false;
        let arr = startBlockOf(row, col);
        return (rowCheck(digit, row, col, passedBoard) || columnCheck(digit, row, col, passedBoard) || blockCheck(digit, passedBoard, arr[0], arr[1], row, col));
    };

    let isSolved = (passedBoard) => {
        for(let i = 0; i < passedBoard.length; i++)
        {
            if(passedBoard[i].value === '0') return false;
            if(isIllegal(passedBoard[i].value, passedBoard, posOf(i)[0], posOf(i)[1]))
                return false;
        }
        return true;
    };

    let start = (passedCanvas) => {
        puzzle = generatePuzzle();
        board = setBoard(puzzle, cellsNum);
        gameWon = false;
        gameOver = false;
        attempts = 0;
        selectedRow = 0;
        selectedCol = 0;
        canvas = passedCanvas;
        c = canvas.getContext('2d');
        draw();
    };
    let draw = () => {
        c.save();
        availableWidth = canvas.width;
        availableHeight = canvas.height - 200;
        cellSize = Math.floor(
        Math.min(availableWidth, availableHeight) / 9
        );
        boardSize = cellSize * 9;
        offsetX = Math.floor((canvas.width - boardSize) / 2);
        offsetY = Math.floor((canvas.height - boardSize) / 2);

        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = '#263D2B';
        for(let i = 0; i < 9; i++)
        {
            c.fillRect(offsetX + (i * cellSize), offsetY + (selectedRow * cellSize), cellSize, cellSize);
        }

        c.fillStyle = '#263D2B';
        for(let i = 0; i < 9; i++)
        {
            c.fillRect(offsetX + (selectedCol * cellSize), offsetY + (i * cellSize), cellSize, cellSize);
        }

        let blockStart = startBlockOf(selectedRow, selectedCol);

        c.fillStyle = '#365C3A';
        for(let i = 0; i < 3; i++)
        {
            for(let j = 0; j < 3; j++)
            {
                c.fillRect(offsetX + (blockStart[1] + j) * cellSize, offsetY + (blockStart[0] + i) * cellSize, cellSize, cellSize);
            }
        }

        c.fillStyle = '#A8E6A0';
        c.fillRect(offsetX + (selectedCol * cellSize), offsetY + (selectedRow * cellSize), cellSize, cellSize);


        c.strokeStyle = color;
        c.lineWidth = 1;
        for(let i = 0; i < 9; i++)
        {
            for(let j = 0; j < 9; j++)
            {
                c.strokeRect(offsetX + (j * cellSize), offsetY + (i * cellSize), cellSize, cellSize);
            }
        }
        c.lineWidth = 3;
        for(let i = 0; i < 3; i++)
        {
            for(let j = 0; j < 3; j++)
            {
                c.strokeRect(offsetX + (3 * j * cellSize), offsetY + (3 * i * cellSize), 3 * cellSize, 3 * cellSize);
            }
        }

        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = cellSize * 0.7 + 'px VT323';
        for(let i = 0; i < 9; i++)
        {
            let txt;
            for(let j = 0; j < 9; j++)
            {
                txt = board[indexOf(i, j)].value;
                if(txt !== '0')
                {
                    if(txt === board[indexOf(selectedRow, selectedCol)].value)
                        c.fillStyle = '#f9fff8';
                    else if(isGiven(i, j, board))
                        c.fillStyle = '#648861';
                    else
                        c.fillStyle = color;
                    if (isIllegal(txt, board, i, j))
                        c.fillStyle = '#ff0000';
                    c.fillText(txt, offsetX + (j + 0.5) * cellSize, offsetY + (i + 0.5) * cellSize);
                }
            }
        }

        c.fillStyle = color;
        c.font = '40px VT323';
        c.fillText('SUDOKU, press Esc to quit', 235, 18);
        if(gameWon)
        {   
            c.fillText('YOU WON', canvas.width/2, 60);
            c.fillText('press R to restart', canvas.width/2, canvas.height - 60);
        }
        if(gameOver)
        {   
            c.fillStyle = 'red';
            c.fillText('GAME OVER', canvas.width/2, 60);
            c.fillText('press R to restart', canvas.width/2, canvas.height - 60);
        }
        c.restore();
    };
    let onKey = (eventType, key) => {
        if(eventType === 'keydown')
        {
            if(gameWon ||  gameOver)
            {
                if(key.toLowerCase() === 'r')
                    start(canvas);
                return;
            }
            if (key === 'ArrowDown')
            {   
                if(selectedRow === 8) return;
                selectedRow++;
                draw();
            }
            else if (key === 'ArrowUp')
            {   
                if(selectedRow === 0) return;
                selectedRow--;
                draw();
            }
            else if (key === 'ArrowRight')
            {   
                if(selectedCol === 8) return;
                selectedCol++;
                draw();
            }
            else if (key === 'ArrowLeft')
            {   
                if(selectedCol === 0) return;
                selectedCol--;
                draw();
            }
            if(key > 0 && key <= 9 && !isGiven(selectedRow, selectedCol, board))
            {
                board[indexOf(selectedRow, selectedCol)].value = String(key);
                if(isIllegal(String(key), board, selectedRow, selectedCol))
                    attempts++;
                gameOver = (attempts === 3);
                gameWon = isSolved(board);
                draw();
            }
            if(key === 'Backspace' && !isGiven(selectedRow, selectedCol, board))
            {
                board[indexOf(selectedRow, selectedCol)].value = '0';
                draw();
            }
        };
    };
    let stop = () => {
        
    };
return {
        start,
        onKey,
        stop
};
})();
export { sudoku };