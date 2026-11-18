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

    // Background
    c.fillStyle = '#050806';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Window layout
    const frameWidth = Math.min(canvas.width * 0.86, 1000);
    const frameHeight = canvas.height * 0.90;

    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = (canvas.height - frameHeight) / 2;

    const headerHeight = 46;
    const footerHeight = 34;
    const padding = 20;

    // Sudoku board sizing
    const maxBoardWidth = frameWidth - padding * 2;
    const maxBoardHeight = frameHeight - headerHeight - footerHeight - padding * 2;

    cellSize = Math.floor(
        Math.min(maxBoardWidth, maxBoardHeight) / 9
    );

    boardSize = cellSize * 9;

    offsetX = Math.floor(
        (canvas.width - boardSize) / 2
    );

    offsetY = Math.floor(
        frameY + headerHeight +
        (frameHeight - headerHeight - footerHeight - boardSize) / 2
    );

    // Main window
    c.strokeStyle = color;
    c.lineWidth = 2;

    c.strokeRect(
        frameX,
        frameY,
        frameWidth,
        frameHeight
    );

    // Header separator
    c.beginPath();
    c.moveTo(frameX, frameY + headerHeight);
    c.lineTo(frameX + frameWidth, frameY + headerHeight);
    c.stroke();

    // Footer separator
    c.beginPath();
    c.moveTo(frameX, frameY + frameHeight - footerHeight);
    c.lineTo(frameX + frameWidth, frameY + frameHeight - footerHeight);
    c.stroke();

    // Header
    c.fillStyle = color;
    c.font = '23px "VT323", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';

    c.fillText(
        'ZIX-OS // SUDOKU',
        frameX + padding,
        frameY + 23
    );

    c.textAlign = 'right';

    c.fillText(
        `ATTEMPTS: ${attempts}/3`,
        frameX + frameWidth - padding,
        frameY + 23
    );

    // Board background
    c.fillStyle = '#050806';
    c.fillRect(offsetX, offsetY, boardSize, boardSize);

    // Selected row
    c.fillStyle = '#15271B';
    c.fillRect(
        offsetX,
        offsetY + selectedRow * cellSize,
        boardSize,
        cellSize
    );

    // Selected column
    c.fillRect(
        offsetX + selectedCol * cellSize,
        offsetY,
        cellSize,
        boardSize
    );

    // Selected 3x3 block
    const blockStart = startBlockOf(selectedRow, selectedCol);

    c.fillStyle = '#203C29';

    c.fillRect(
        offsetX + blockStart[1] * cellSize,
        offsetY + blockStart[0] * cellSize,
        cellSize * 3,
        cellSize * 3
    );

    // Selected cell
    c.fillStyle = '#365C3A';

    c.fillRect(
        offsetX + selectedCol * cellSize,
        offsetY + selectedRow * cellSize,
        cellSize,
        cellSize
    );

    // Grid lines
    c.strokeStyle = color;
    c.lineWidth = 1;

    for (let i = 0; i <= 9; i++) {
        c.beginPath();

        c.moveTo(offsetX + i * cellSize, offsetY);
        c.lineTo(offsetX + i * cellSize, offsetY + boardSize);

        c.stroke();

        c.beginPath();

        c.moveTo(offsetX, offsetY + i * cellSize);
        c.lineTo(offsetX + boardSize, offsetY + i * cellSize);

        c.stroke();
    }

    // 3x3 block borders
    c.lineWidth = 3;

    for (let i = 0; i <= 3; i++) {
        c.beginPath();

        c.moveTo(offsetX + i * cellSize * 3, offsetY);
        c.lineTo(offsetX + i * cellSize * 3, offsetY + boardSize);

        c.stroke();

        c.beginPath();

        c.moveTo(offsetX, offsetY + i * cellSize * 3);
        c.lineTo(offsetX + boardSize, offsetY + i * cellSize * 3);

        c.stroke();
    }

    // Numbers
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `${cellSize * 0.68}px "VT323", monospace`;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {

            const currentCell = board[indexOf(i, j)];
            const txt = currentCell.value;

            if (txt === '0') continue;

            // Number colors
            if (isIllegal(txt, board, i, j)) {
                c.fillStyle = '#FF4545';
            }
            else if (i === selectedRow && j === selectedCol) {
                c.fillStyle = '#FFFFFF';
            }
            else if (
                txt === board[indexOf(selectedRow, selectedCol)].value
            ) {
                c.fillStyle = '#00C96B';
            }
            else if (currentCell.given) {
                c.fillStyle = '#648861';
            }
            else {
                c.fillStyle = color;
            }

            c.fillText(
                txt,
                offsetX + (j + 0.5) * cellSize,
                offsetY + (i + 0.5) * cellSize
            );
        }
    }

    // Game over / victory overlay
    if (gameWon || gameOver) {

        c.fillStyle = 'rgba(0, 8, 4, 0.82)';

        c.fillRect(
            offsetX,
            offsetY,
            boardSize,
            boardSize
        );

        c.textAlign = 'center';
        c.textBaseline = 'middle';

        c.fillStyle = gameWon ? '#00C96B' : '#FF4545';

        c.font = '48px "VT323", monospace';

        c.fillText(
            gameWon ? 'YOU WON' : 'GAME OVER',
            canvas.width / 2,
            canvas.height / 2 - 20
        );

        c.font = '26px "VT323", monospace';

        c.fillText(
            'PRESS R TO RESTART',
            canvas.width / 2,
            canvas.height / 2 + 25
        );
    }

    // Footer
    c.fillStyle = color;
    c.font = '16px "VT323", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';

    c.fillText(
        'ARROWS MOVE  1-9 ENTER  BACKSPACE CLEAR',
        frameX + padding,
        frameY + frameHeight - 17
    );

    c.textAlign = 'right';

    c.fillText(
        'ESC TO EXIT',
        frameX + frameWidth - padding,
        frameY + frameHeight - 17
    );

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