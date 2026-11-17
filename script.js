

const introContainer = document.querySelector('#intro');
const logoVideo = document.querySelector('#logo-intro');

function endIntro() {
    introContainer.classList.add('ended');
    setTimeout(() => introContainer.remove(), 700);
}
logoVideo.addEventListener('ended', endIntro);
logoVideo.addEventListener('error', endIntro);
setTimeout(endIntro, 8000);

document.addEventListener('keydown', (event) => {
    endIntro();
}, { once: true })

document.addEventListener('click', (event) => {
    endIntro();
}, { once: true })

let canvas = document.querySelector('#main-canvas');
let c = canvas.getContext('2d');
let input = document.querySelector('input');
let renderHistory = [];
let historyIndex = 0;
let nowFolder;
let cursorOn = true;
let isTyping = false;
let typingTimeout;
let maxWidth;
let color = '#008F46';
const audioEnter = new Audio('sfx-re.wav');
const audioType = new Audio('sfx-add.wav');

let pathToText = (nodePassed) => {
    let path = [];
    let node = nodePassed;
    while(node && node !== root)
    {
        path.unshift(node.value);
        node = node.parent;
    }
    return path.join('/')
}

let movePrompt = (line, nodePassed) => {
    let node = nodePassed;
    let prompt = 'visitor@zixos: ~/' + pathToText(node) + ' $';
    c.fillText(prompt, 40,  line + 80)
    let num = 12 + line + 40;
    let leftPos = (50 + c.measureText(prompt).width + 10);
    input.style.width = (canvas.width - leftPos - 40) + 'px';
    input.style.top = num.toString() + 'px';
    input.style.left = leftPos + 'px';
    return leftPos;
};

class folderNode{
    constructor(value){
        this.parent = null;
        this.value = value;
        this.children = [];
    }
};

let addItem = (tree, parent, value, type, content, link) => {
    if(parent && parent.type === 'file')
        return
    let node = new tree(value);
    node.parent = parent;
    node.type = type;
    if(parent)
        parent.children.push(node);
    if(node.type === 'file')
    {
        node.content = content;
        node.url = link;
    }
    return node;
}

let root = addItem(folderNode, null, 'root', 'folder');
let projects = addItem(folderNode, root, 'projects', 'folder');
let prjct1 = addItem(folderNode, projects, 'ascii-camera.app', 'file',
    "Real-time webcam to ASCII art in the browser.\nType 'open ascii-camera.app' to see the demo.", "https://zascii-camera.netlify.app/");
let prjct2 = addItem(folderNode, projects, 'neverdolist.app', 'file', 
    "A small to-do app with an animated logo.\nType 'open neverdolist.app' to see the demo.", "https://neverdolist.netlify.app/");
let prjct3 = addItem(folderNode, projects, 'zoogle.app', 'file',
    "Zoogle parody page with Easter eggs.\nType 'open zoogle.app' to see the demo.", "https://zoogleit.netlify.app/");
let about = addItem(folderNode, root, 'about', 'folder');
let abt1 = addItem(folderNode, about, 'bio.txt', 'file',
    "CS student and motion designer from Algeria.\nAlso a guy trying to be COOL online.");
let abt2 = addItem(folderNode, about, 'contact.txt', 'file',
    "github - kw20d\nmotion instagram & youtube- zix9ted\nphotography insta - zix9cam\nmail - zixcnct@gmail.com");
let gallery = addItem(folderNode, root, 'motion', 'folder');
let vid1 = addItem(folderNode, gallery, 'devil-9-5.mp4', 'file',"Type open devil-9-5.mp4 to see" , "https://www.instagram.com/p/DdeVjINoV9V/");
let vid2 = addItem(folderNode, gallery, 'my-life-in-3d.mp4', 'file',"Type open my-life-in-3d.mp4 to see" , "https://www.instagram.com/p/DYNGmdUx4qj/");
let vid3 = addItem(folderNode, gallery, 'oh-no-AI.mp4', 'file',"Type open oh-no-AI.mp4 to see" , "https://www.instagram.com/p/DWt9sgto-LP/");
let vid4 = addItem(folderNode, gallery, 'endless-hobbies.mp4', 'file',"Type open endless-hobbies.mp4 to see" , "https://www.instagram.com/p/DXKR4xGI-kV/");
let vid5 = addItem(folderNode, gallery, 'blender-journey.mp4', 'file' ,"Type open blender-journey.mp4 to see", "https://www.instagram.com/p/DXcVHmGRTEy/");

let wrapText = (text) => {
    if (!text)
        return [];

    let lines = text.split('\n');
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        let words = lines[i].split(' ');
        let currentLine = "";

        for (let j = 0; j < words.length; j++) {
            let word = words[j];

            let testLine = currentLine === ""
                ? word
                : currentLine + " " + word;

            if (c.measureText(testLine).width <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine !== "")
                    result.push(currentLine);

                currentLine = word;
            }
        }

        if (currentLine !== "")
            result.push(currentLine);
    }

    return result;
};

let addToHistory = (text) => {
    let wrappedLines = wrapText(text);

    for(let i = 0; i < wrappedLines.length; i++) {
        renderHistory.push(wrappedLines[i]);
    }
};

let render = () => {
    let visibleRows = Math.floor(((canvas.height - 80) / 40) - 1);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'black';
    c.fillRect(0,0,canvas.width,canvas.height);
    c.fillStyle = color;
    let visibleHistory = renderHistory;
    if(renderHistory.length > visibleRows)
    {
        visibleHistory = renderHistory.slice(-visibleRows);
    }
    let line = visibleHistory.length * 40;
    for(let i = 0; i < visibleHistory.length; i++)
    {
        c.fillText(visibleHistory[i], 40, 80 + 40*i);
    }
    input.style.color = color;
    let L = movePrompt(line, nowFolder);
    if(cursorOn)
    {
        let num = 12 + line + 40;
        c.fillRect(L + c.measureText(input.value).width + 5, num - 6, 20, 40);
    }
};

let listChildren = (node) => {
    let path = '';
    for(let i = 0; i < node.children.length; i++)
    {
        if(node.children[i].type === 'file') path += '   ' + node.children[i].value +'*';
        else path += '   ' + node.children[i].value + '/';
    }
    if(path === '')
        path = 'empty folder';
    return path;
};

let listContent = () => {
    addToHistory(listChildren(nowFolder));
}

let changeDir = txt => {
    if(!txt)
    {
        throw new Error('enter folder name');
    }
    if(txt === '..')
    {
        if(nowFolder.parent)
        {
            nowFolder = nowFolder.parent;
            return;
        }
        else 
            return;
    }
    let arr = findChild(txt, nowFolder);
    if(!arr [0])
        throw new Error('no such folder');
    else
    {
        if(arr[2] === 'folder')
            nowFolder = arr[1];
        else
            throw new Error('not a directory');
    }
}

let findChild = (txt, node) => {
    let type = null;
    let found = false;
    let child = node.children.find(child => child.value === txt);
    if(child !== undefined)
        found = true;
    if(child)
        type = child.type;
    return [found, child, type];
} 

let clearScreen = () => {
    renderHistory = [];
}

let helpCommands = () => {
    let commandsList = '';
    for (let command of Object.values(commands))
        commandsList += command.description;
    addToHistory(commandsList);
}

let fileContent = (name, node) => {
    if(!name)
        throw new Error('enter file name');
    let arr = findChild(name, node);
    if(!arr[0])
        throw new Error('no such file');
    else
    {
        if(arr[2] === 'file')
            addToHistory(arr[1].content);
        else
            throw new Error('is a directory');
    }
}

let urlOpen = (name, node) => {
    if(!name)
        throw new Error('enter file name');
    let arr = findChild(name, node);
    if(!arr[0])
        throw new Error('no such file');
    else
    {
        if(arr[2] === 'file' && arr[1].url)
            window.open(arr[1].url);
        else
            throw new Error('nothing to open');
    }
}

let setColor = (text) => {
    if (!text[0])
        throw new Error('enter a color');
    if(text[0] === 'default')
    {
       color = '#008F46';
        return;
    }
    if (!CSS.supports('color', text[0]))
        throw new Error('invalid color');

    color = text[0];
}

let runningProgram = null;

const programs = {
    'snake': {
    start() {
        this.dashing = false;
        this.score = 0;
        this.gameOver = false;
        this.x = Math.floor(canvas.width / 40) * 20;
        this.y = Math.floor(canvas.height / 40) * 20;
        this.direction = 'right';
        this.body = [
            {x: this.x, y: this.y},
            {x: this.x - 20, y: this.y},
            {x: this.x - 40, y: this.y},
            {x: this.x - 60, y: this.y},
            {x: this.x - 80, y: this.y}
        ];
        this.spawnFood();
        this.draw();
        this.intervalId = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
        input.focus();
    },

    draw() {
        if (runningProgram !== 'snake') return;

        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.strokeStyle = color;
        c.strokeRect(40, 38, canvas.width - 80, canvas.height - 58);

        c.fillStyle = color;
        c.fillText('SNAKE, press Esc to quit', 40, 30);
        c.fillText('score : ' + this.score, canvas.width - (5 + String(this.score).length) * 40, 30);

        c.fillStyle = color;
        this.body.forEach(snakePart => {
            c.fillRect(snakePart.x, snakePart.y, 20, 20);
        });

        c.fillStyle = 'red';
        c.fillRect(this.food.x, this.food.y, 20, 20);

        if (this.gameOver) {
            c.fillStyle = 'red';
            c.textAlign = 'center';
            c.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
            c.fillText('press R to resart', canvas.width / 2, canvas.height / 2+20);
            c.textAlign = 'left';
        }
    },

    update() {
        if (this.gameOver) return;
        switch(this.direction) {
            case 'right': {
                if (this.x >= canvas.width - 60) this.x = 20;
                this.x += 20;
                break;
            }
            case 'left': {
                if (this.x <= 40) this.x = canvas.width - 60;
                this.x -= 20;
                break;
            }
            case 'up': {
                if (this.y <= 40) this.y = canvas.height - 20;
                this.y -= 20;
                break;
            }
            case 'down': {
                if (this.y >= canvas.height - 40) this.y = 20;
                this.y += 20;
                break;
            } }

        this.head = { x: this.x, y: this.y} ;
        this.body.unshift(this.head);

        if (this.body.slice(1).some(part =>
            part.x === this.head.x && part.y === this.head.y
        )) {
            this.gameOver = true;
            clearInterval(this.intervalId);
            return;
        }

        if (this.head.x === this.food.x && this.head.y === this.food.y)
        {
            this.spawnFood();
            this.score++;
        }
        else
            this.body.pop();
    },

    spawnFood() {
        do {
            this.food = {
                x: 80 + Math.floor(Math.random() * Math.floor((canvas.width - 180) / 20)) * 20,
                y: 80 + Math.floor(Math.random() * Math.floor((canvas.height - 160) / 20)) * 20
            };
        } while (
            this.body.some(part =>
                part.x === this.food.x && part.y === this.food.y
            )
        );
    },

    dash() {
        if (this.gameOver) return;

        clearInterval(this.intervalId);

        this.intervalId = setInterval(() => {
            this.update();
            this.draw();
        }, this.dashing ? 60 : 150);
    },

    onKey(eventType, key) {
        if (key === 'ArrowDown' && this.direction !== 'up')
            this.direction = 'down';
        else if (key === 'ArrowUp' && this.direction !== 'down')
            this.direction = 'up';
        else if (key === 'ArrowLeft' && this.direction !== 'right')
            this.direction = 'left';
        else if (key === 'ArrowRight' && this.direction !== 'left')
            this.direction = 'right';
        else if (key.toLowerCase() === 'r' && this.gameOver) {
            clearInterval(this.intervalId);
            this.start();
        }
        else if (key === 'Shift') {
            if (eventType === 'keydown' && !this.dashing) {
                this.dashing = true;
                this.dash();
            }
            else if (eventType === 'keyup' && this.dashing) {
                this.dashing = false;
                this.dash();
            }
        }
    },

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        isTyping = false;
        cursorOn = true;
        addToHistory('quit');
        input.focus();
    }
    }
}
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
c.font = ('40px VT323, monospace');
maxWidth = canvas.width - 80;
nowFolder = root;
document.fonts.load("40px VT323")
    .then(() => {
        render();
    })
    .catch((error) => {
        console.error("Font loading failed:", error);
        render();
    });

setInterval(() => {
    if(!isTyping && runningProgram === null)
    {
        cursorOn = !cursorOn;
        render();
    }
}, 500);

const commands = {
    help: {
        execute: () => helpCommands(),
        description: 'help - see commands\n'
    },

    clear: {
        execute: () => clearScreen(),
        description: 'clear - resets the terminal\n'
    },

    echo: {
        execute: (txt) => addToHistory(txt.join(" ")),
        description: 'echo - prints\n'
    },

    whoami: {
        execute: () => addToHistory("Zixted's Fan"),
        description: 'whoami - tells you who you are\n'
    },

    ls: {
        execute: () => listContent(),
        description: 'ls - listing files\n'
    },

    cd: {
        execute: (txt) => changeDir(txt[0]),
        description: 'cd - changes the working directory\n'
    },

    cat: {
        execute: (txt) => fileContent(txt[0], nowFolder),
        description: 'cat - file content\n'
    },

    color: {
        execute: (txt) => setColor(txt),
        description: 'color - change text color\n'
    },

    pwd: {
        execute: () => {
            if (nowFolder != root)
                addToHistory('root/' + pathToText(nowFolder));
            else
                addToHistory('root');
        },
        description: 'pwd - display the current directory\n'
    },

    resume: {
        execute: () => window.open("resume.pdf"),
        description: 'resume - check my resume\n'
    },

    open: {
        execute: (txt) => urlOpen(txt[0], nowFolder),
        description: 'open - opens the file attached url\n'
    },
    start:{ 
        execute: (txt) => {
            if(!txt[0])
                throw new Error('enter game name');
            if(!Object.hasOwn(programs, txt[0]))
                throw new Error('no such game');
            runningProgram = txt[0];
            programs[txt[0]].start();
        },
        description: 'start - play the games\n'
    }
};

let commandHistory = [];
input.addEventListener('keydown', (event) => {
    if(runningProgram === null)
    {
        if (event.key === 'ArrowUp') {
        audioType.currentTime = 0;
        audioType.play();
        event.preventDefault();
        if (historyIndex > 0)
        {
            historyIndex--;
            input.value = commandHistory[historyIndex];
            render();
        }
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            audioType.currentTime = 0;
            audioType.play();
            if (historyIndex < commandHistory.length)
            {
                historyIndex++;
                if(historyIndex == commandHistory.length)
                {
                    input.value = '';
                    render();
                    return;
                }
                input.value = commandHistory[historyIndex];
                render();
            }
        }
        else if(event.key === 'Enter')
        {
            audioEnter.play();
            if(input.value.trim() !== '')
            {
                    let parts = input.value.trim().split(" ");
                    addToHistory('visitor@zixos: ~/' + pathToText(nowFolder) + ' $ '+ input.value);
                    let command = parts[0];
                    try {
                        if(!Object.hasOwn(commands, command))
                            throw new Error('command not found: ' + command + " type 'help'");
                        commands[command].execute(parts.slice(1));
                    } catch (err) {
                        addToHistory('error: ' + err.message);
                        console.error(err);
                    }
                    commandHistory.push(parts.join(' '));
                    historyIndex = commandHistory.length;
                    input.value='';
                    if (runningProgram === null)
                        render();
            }
        }
    }
    else 
        {
        let current = runningProgram;

        event.preventDefault();

        if (event.key === 'Escape') {
            programs[current].stop();
            runningProgram = null;
            render();
            return;
        }

        programs[current].onKey(event, event.key);

        if (event.key === 'Shift') {
            programs[current].onKey(event.type, event.key);
        }
    }
});


input.addEventListener('keyup', event => {
    if(runningProgram === null) return;
    if (event.key === 'Shift')
        programs[runningProgram].onKey(event.type, event.key);
});

input.addEventListener('input', () => {
    if (runningProgram !== null) return;
    audioType.currentTime = 0;
    audioType.play();
    isTyping = true;
    cursorOn = true;
    render();

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        if (runningProgram !== null) return;
        isTyping = false;
        cursorOn = true;
        render();
    }, 600);
});


window.addEventListener('load', () => {
    input.focus();
});

document.addEventListener('click', () => {
    input.focus();
});