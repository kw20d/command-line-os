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

let draw = () => {
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.strokeStyle = color;
    c.strokeRect(40, 38, canvas.width - 80, canvas.height - 58);

    c.fillStyle = color;
    c.fillText('SNAKE, press Esc to quit', 40, 30);
    c.fillText(
        'score : ' + score,
        canvas.width - (5 + String(score).length) * 40,
        30
    );

    c.fillStyle = color;
    body.forEach(snakePart => {
        c.fillRect(snakePart.x, snakePart.y, 20, 20);
    });

    c.fillStyle = 'red';
    c.fillRect(food.x, food.y, 20, 20);

    if (gameOver) {
        c.fillStyle = 'red';
        c.textAlign = 'center';
        c.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        c.fillText('press R to restart', canvas.width / 2, canvas.height / 2 + 20);
        c.textAlign = 'left';
    }
};

let update = () => {
    if (gameOver) return;

    switch (direction) {
        case 'right':
            if (x >= canvas.width - 60) x = 20;
            x += 20;
            break;

        case 'left':
            if (x <= 40) x = canvas.width - 60;
            x -= 20;
            break;

        case 'up':
            if (y <= 40) y = canvas.height - 20;
            y -= 20;
            break;

        case 'down':
            if (y >= canvas.height - 40) y = 20;
            y += 20;
            break;
    }

    head = { x: x, y: y };
    body.unshift(head);

    if (body.slice(1).some(part =>
        part.x === head.x && part.y === head.y
    )) {
        gameOver = true;
        clearInterval(intervalId);
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        spawnFood();
        score++;
    } else {
        body.pop();
    }
};

let spawnFood = () => {
    do {
        food = {
            x: 80 + Math.floor(Math.random() * Math.floor((canvas.width - 180) / 20)) * 20,
            y: 80 + Math.floor(Math.random() * Math.floor((canvas.height - 160) / 20)) * 20
        };
    } while (
        body.some(part =>
            part.x === food.x && part.y === food.y
        )
    );
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
    
    
    if (!isRunning) return;
    if (key === 'ArrowDown' && direction !== 'up')
        direction = 'down';

    else if (key === 'ArrowUp' && direction !== 'down')
        direction = 'up';

    else if (key === 'ArrowLeft' && direction !== 'right')
        direction = 'left';

    else if (key === 'ArrowRight' && direction !== 'left')
        direction = 'right';

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

    else if (key === 'Escape')
        stop();
};

let stop = () => {
    isRunning = false;
    clearInterval(intervalId);
};

let start = (passedCanvas) => {
    isRunning = true;
    canvas = passedCanvas;
    c = canvas.getContext('2d');

    c.font = '40px VT323, monospace';

    clearInterval(intervalId);

    dashing = false;
    score = 0;
    gameOver = false;

    x = Math.floor(canvas.width / 40) * 20;
    y = Math.floor(canvas.height / 40) * 20;

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