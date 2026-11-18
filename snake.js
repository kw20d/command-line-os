
const snake = (() => {
    let canvas;
    let c;

    let color = '#008F46';

    let dashing;
    let food;
    let head;
    let intervalId;
    let score;
    let gameOver;
    let x;
    let y;
    let direction;
    let body = [];
    let isRunning = false;
    let directionChanged;

    // Camera-matching window layout

    let frame;
    let playX;
    let playY;
    let playWidth;
    let playHeight;

    const getFrame = () => {
        const width = Math.min(canvas.width * 0.76, 1100);
        const height = canvas.height * 0.74;

        return {
            x: (canvas.width - width) / 2,
            y: (canvas.height - height) / 2,
            width,
            height
        };
    };

    const setLayout = () => {
        frame = getFrame();

        const padding = 20;
        const headerHeight = 46;
        const footerHeight = 34;

        playX = frame.x + padding;
        playY = frame.y + headerHeight;

        playWidth = frame.width - padding * 2;
        playHeight = frame.height - headerHeight - footerHeight;
    };

    let draw = () => {
        c.fillStyle = '#050806';
        c.fillRect(0, 0, canvas.width, canvas.height);

        // Main window border

        c.strokeStyle = color;
        c.lineWidth = 2;

        c.strokeRect(
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );

        // Header separator

        c.beginPath();
        c.moveTo(frame.x, frame.y + 46);
        c.lineTo(frame.x + frame.width, frame.y + 46);
        c.stroke();

        // Footer separator

        c.beginPath();
        c.moveTo(frame.x, frame.y + frame.height - 34);
        c.lineTo(
            frame.x + frame.width,
            frame.y + frame.height - 34
        );
        c.stroke();

        // Header

        c.fillStyle = color;
        c.font = '23px "VT323", monospace';
        c.textBaseline = 'middle';
        c.textAlign = 'left';

        c.fillText(
            'ZIX-OS // SNAKE',
            frame.x + 20,
            frame.y + 23
        );
        c.textAlign = 'right';

        c.fillText(
            `SCORE: ${score}`,
            frame.x + frame.width - 20,
            frame.y + 23
        );

        // Playfield

        c.strokeStyle = color;
        c.lineWidth = 1;

        c.strokeRect(
            playX,
            playY,
            playWidth,
            playHeight
        );

        // Snake

        c.fillStyle = color;

        body.forEach((snakePart, index) => {
            if (index === 0) {
                c.fillStyle = '#00C96B';
            } else {
                c.fillStyle = color;
            }

            c.fillRect(
                snakePart.x,
                snakePart.y,
                20,
                20
            );
        });

        // Food

        c.fillStyle = '#FF4545';

        c.fillRect(
            food.x,
            food.y,
            20,
            20
        );

        // Game over

        if (gameOver) {
            c.fillStyle = '#FF4545';
            c.textAlign = 'center';
            c.textBaseline = 'middle';

            c.font = '40px "VT323", monospace';

            c.fillText(
                'GAME OVER',
                playX + playWidth / 2,
                playY + playHeight / 2 - 20
            );

            c.font = '24px "VT323", monospace';

            c.fillText(
                'PRESS R TO RESTART',
                playX + playWidth / 2,
                playY + playHeight / 2 + 25
            );
        }

        // Footer

        c.fillStyle = color;
        c.font = '16px "VT323", monospace';
        c.textBaseline = 'middle';
        c.textAlign = 'left';

        c.fillText(
            'ARROWS MOVE  SHIFT DASH',
            frame.x + 20,
            frame.y + frame.height - 17
        );

        c.textAlign = 'right';

        c.fillText(
            'ESC TO EXIT',
            frame.x + frame.width - 20,
            frame.y + frame.height - 17
        );

        c.textAlign = 'left';
        c.textBaseline = 'alphabetic';
    };

    
let update = () => {
    if (gameOver) return;

    directionChanged = false;

    const cols = Math.floor(playWidth / 20);
    const rows = Math.floor(playHeight / 20);

    let dx = 0;
    let dy = 0;

    switch (direction) {
        case 'right':
            dx = 1;
            break;
        case 'left':
            dx = -1;
            break;
        case 'up':
            dy = -1;
            break;
        case 'down':
            dy = 1;
            break;
    }

    // Convert position to grid coordinates
    let gridX = Math.round((x - playX) / 20);
    let gridY = Math.round((y - playY) / 20);

    // Move and wrap around the grid
    gridX = (gridX + dx + cols) % cols;
    gridY = (gridY + dy + rows) % rows;

    x = playX + gridX * 20;
    y = playY + gridY * 20;

    head = { x, y };

    body.unshift(head);

    // Self collision
    if (body.slice(1).some(part =>
        part.x === head.x && part.y === head.y
    )) {
        gameOver = true;
        clearInterval(intervalId);
        return;
    }

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        spawnFood();
    } else {
        body.pop();
    }
};


    let spawnFood = () => {
    const cols = Math.floor(playWidth / 20);
    const rows = Math.floor(playHeight / 20);

    const availableCells = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = {
                x: playX + col * 20,
                y: playY + row * 20
            };

            const occupied = body.some(part =>
                part.x === cell.x && part.y === cell.y
            );

            if (!occupied) {
                availableCells.push(cell);
            }
        }
    }

    if (availableCells.length === 0) {
        gameOver = true;
        clearInterval(intervalId);
        return;
    }

    food = availableCells[
        Math.floor(Math.random() * availableCells.length)
    ];
};

    let dash = () => {
        if (gameOver) return;

        clearInterval(intervalId);

        intervalId = setInterval(() => {
            update();
            draw();
        }, dashing ? 60 : 150);
    };

    let onKey = (eventType, key) => {
        if (
            ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(key) &&
            directionChanged
        ) return;

        if (!isRunning) return;

        if (key === 'ArrowDown' && direction !== 'up') {
            direction = 'down';
            directionChanged = true;
        }

        else if (key === 'ArrowUp' && direction !== 'down') {
            direction = 'up';
            directionChanged = true;
        }

        else if (key === 'ArrowLeft' && direction !== 'right') {
            direction = 'left';
            directionChanged = true;
        }

        else if (key === 'ArrowRight' && direction !== 'left') {
            direction = 'right';
            directionChanged = true;
        }

        else if (key.toLowerCase() === 'r' && gameOver) {
            clearInterval(intervalId);
            start(canvas);
        }

        else if (key === 'Shift') {
            if (eventType === 'keydown' && !dashing) {
                dashing = true;
                dash();
            }

            else if (eventType === 'keyup' && dashing) {
                dashing = false;
                dash();
            }
        }

        else if (key === 'Escape') {
            stop();
        }
    };

    let stop = () => {
        isRunning = false;
        clearInterval(intervalId);
    };

    let start = (passedCanvas) => {
        directionChanged = false;
        isRunning = true;

        canvas = passedCanvas;
        c = canvas.getContext('2d');

        c.font = '40px VT323, monospace';

        clearInterval(intervalId);

        dashing = false;
        score = 0;
        gameOver = false;

        setLayout();

        const cols = Math.floor(playWidth / 20);
        const rows = Math.floor(playHeight / 20);

        x = playX + Math.floor(cols / 2) * 20;
        y = playY + Math.floor(rows / 2) * 20;

        direction = 'right';

        body = [
            { x: x, y: y },
            { x: x - 20, y: y },
            { x: x - 40, y: y },
            { x: x - 60, y: y },
            { x: x - 80, y: y }
        ];

        spawnFood();
        draw();

        intervalId = setInterval(() => {
            update();
            draw();
        }, 150);
    };

    return {
        start,
        onKey,
        stop
    };
})();

export { snake };
