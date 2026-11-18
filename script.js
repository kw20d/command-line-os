import { snake } from './snake.js';
import { sudoku } from './sudoku.js';
import { camera } from './camera.js';

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
let abt2 = addItem(folderNode, about, 'contact', 'folder',)
let github = addItem(folderNode, abt2, 'github', 'file',"@kw20d Type open github to see" , "https://github.com/kw20d");
let instagram = addItem(folderNode, abt2, 'instagram', 'file',"@zix9ted Type open instagram to see" , "https://www.instagram.com/zix9ted/");
let youtube = addItem(folderNode, abt2, 'youtube', 'file',"@zix9ted Type open youtube to see" , "https://www.youtube.com/@zix9ted");
let photography = addItem(folderNode, abt2, 'photography', 'file',"@zix9can Type open photography to see" , "https://www.instagram.com/zix9cam/");
let mail = addItem(folderNode, abt2, 'mail', 'file',"Type open mail to see" , "https://mail.google.com/mail/u/0/?to=zixcnct@gmail.com&fs=1&tf=cm");
let gallery = addItem(folderNode, root, 'motion', 'folder');
let vid1 = addItem(folderNode, gallery, 'devil-9-5.mp4', 'file',"Type open devil-9-5.mp4 to see" , "https://www.instagram.com/p/DdeVjINoV9V/");
let vid2 = addItem(folderNode, gallery, 'my-life-in-3d.mp4', 'file',"Type open my-life-in-3d.mp4 to see" , "https://www.instagram.com/p/DYNGmdUx4qj/");
let vid3 = addItem(folderNode, gallery, 'oh-no-AI.mp4', 'file',"Type open oh-no-AI.mp4 to see" , "https://www.instagram.com/p/DWt9sgto-LP/");
let vid4 = addItem(folderNode, gallery, 'endless-hobbies.mp4', 'file',"Type open endless-hobbies.mp4 to see" , "https://www.instagram.com/p/DXKR4xGI-kV/");
let vid5 = addItem(folderNode, gallery, 'blender-journey.mp4', 'file' ,"Type open blender-journey.mp4 to see", "https://www.instagram.com/p/DXcVHmGRTEy/");
let programsPlace = addItem(folderNode, root, 'programs', 'folder');
let program1 = addItem(folderNode, programsPlace, 'snake', 'file', "Type start snake to play it");
let program2 = addItem(folderNode, programsPlace, 'sudoku', 'file', "Type start sudoku to play it");
let program3 = addItem(folderNode, programsPlace, 'camera', 'file', "Type start camera to start it");

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
    c.font = '40px VT323, monospace';
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    c.lineWidth = 1;
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
    snake,
    sudoku,
    camera,
};

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
    start: {
        execute: (txt) => {
            if (!txt[0])
                throw new Error('enter program name');

            if (nowFolder !== programsPlace)
                throw new Error('programs are only accessible inside programs/');

            let program = findChild(txt[0], nowFolder);

            if (!program[0])
                throw new Error('program not found');

            if (program[2] !== 'file')
                throw new Error('not a program file');

            if (!Object.hasOwn(programs, txt[0]))
                throw new Error('program is not executable');

            runningProgram = txt[0];
            programs[txt[0]].start(canvas);
        },
        description: 'start - try the programs\n'
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

        programs[current].onKey(event.type, event.key);
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