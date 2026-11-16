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
let maxChars;

let pathToText = (nodePassed) => {
    let path = [];
    let node = nodePassed;
    while(node && node !== root)
    {
        path.unshift(node.value);
        node = node.parent;
    }
    return '~/' + path.join('/') + ' >';;
}

let movePrompt = (line, nodePassed) => {
    let node = nodePassed;
    let prompt = pathToText(node);
    c.fillText(prompt, 40,  line + 80)
    let num = 12 + line + 40;
    let leftPos = (50 + c.measureText(prompt).width + 10);
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

let addItem = (tree, parent, value, type, content) => {
    if(parent && parent.type === 'file')
        return
    let node = new tree(value);
    node.parent = parent;
    node.type = type;
    if(parent)
        parent.children.push(node);
    if(node.type === 'file')
        node.content = content;
    return node;
}

let root = addItem(folderNode, null, 'root', 'folder');
let projects = addItem(folderNode, root, 'projects', 'folder');
let prjct1 = addItem(folderNode, projects, 'ascii-camera', 'file',
    "Real-time webcam to ASCII art in the browser.\nType 'camera' to see the demo.");
let prjct2 = addItem(folderNode, projects, 'neverdolist', 'file', 
    "A small to-do app with an animated logo.\nType 'neverdolist' to see the demo.");
let prjct3 = addItem(folderNode, projects, 'zoogle', 'file',
    "Zoogle parody page with Easter eggs.\nType 'zoogle' to see the demo.");
let about = addItem(folderNode, root, 'about', 'folder');
let abt1 = addItem(folderNode, about, 'bio', 'file',
    "CS student and motion designer from Algeria.\nAlso a guy trying to be COOL online.");
let abt2 = addItem(folderNode, about, 'contact', 'file',
    "zix9ted on all platforms");

let wrapText = (text) => {
    let lines = text.split('\n');
    let result = [];
    for(let i = 0; i < lines.length; i++)
    {
        let words = lines[i].split(' ');
        let currentLine = "";
        let wrappedLines = [];
        for(let j = 0; j < words.length; j++)
        {
            let word = words[j];
            let testLine = "";

        if(currentLine === "")
            testLine = word;
        else
            testLine = currentLine + " " + word;
            if(c.measureText(testLine).width <= maxWidth)
                currentLine = testLine;
            else {
                if(currentLine !== "")
                    wrappedLines.push(currentLine);
                currentLine = word;
            }
        }
        if(currentLine !== "")
            wrappedLines.push(currentLine);
        for(let k = 0; k < wrappedLines.length; k++) {
            result.push(wrappedLines[k]);
        }
    }
    return result;
}

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
    c.fillStyle = 'green';
    if(renderHistory.length > visibleRows)
    {
        renderHistory = renderHistory.slice(-visibleRows);
    }
    let line = renderHistory.length * 40;
    for(let i = 0; i < renderHistory.length; i++)
    {
        c.fillText(renderHistory[i], 40, 80 + 40*i);
    }
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
        else path += '   ' + node.children[i].value;
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
    let found = false;  
    for(let i = 0; i < nowFolder.children.length; i++)
    {
        if(txt === nowFolder.children[i].value && nowFolder.children[i].type === 'folder') 
        {
            nowFolder = nowFolder.children[i];
            found = true;
            break;
        }
    }
    if(found === false)
        throw new Error('no such folder');
}

let clearScreen = () => {
    renderHistory = [];
}

let helpCommands = () => {
    let commandsList = 'clear - resets the terminal\nhelp - see commands\necho - prints\nwhoami - tells you\nls - listing files\ncd - changes the working directory\ncat - file content'
    addToHistory(commandsList);
}

let fileContent = (name, node) => {
    if(!name)
        throw new Error('enter file name');
    for(let i = 0; i < node.children.length; i++)
    {
        if(node.children[i].value === name && node.children[i].type === 'file')
        {
            addToHistory(node.children[i].content);
            return;
        }
    }
    throw new Error('no such file');
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
c.font = ('40px monospace');
maxWidth = canvas.width - 40;
maxChars = Math.floor(maxWidth / c.measureText('M').width);
nowFolder = root;
render();

setInterval(() => {
    if(!isTyping)
    {
        cursorOn = !cursorOn;
        render();
    }
}, 500);

const commands = {
    'help':  () => helpCommands(),
    'clear': () => clearScreen(),
    'echo': (txt) => addToHistory(txt.join(" ")),
    'whoami': () => addToHistory("Zixted's Fan"),
    'ls': () => listContent(),
    'cd': (txt) => changeDir(txt[0]),
    'cat': (txt) => fileContent(txt[0], nowFolder),
    'camera': () => window.open("https://zascii-camera.netlify.app/", "ascii-camera"),
    'zoogle': () => window.open("https://zoogleit.netlify.app/", "zoogle"),
    'neverdolist': () => window.open("https://neverdolist.netlify.app/", "neverdolist"),
};
let commandHistory = [];
input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
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
        if(input.value != '')
        {
                let parts = input.value.trim().split(" ");
                addToHistory(pathToText(nowFolder) + " " + input.value);
                let command = parts[0];
                try {
                    if(!Object.hasOwn(commands, command))
                        throw new Error('command not found: ' + command);
                    commands[command](parts.slice(1));
                } catch (err) {
                    addToHistory('error: ' + err.message);
                    console.error(err);
                }
                commandHistory.push(parts.join(' '));
                historyIndex = commandHistory.length;
                input.value='';
                render();
        }
    }
});

input.addEventListener('input', () => {
    isTyping = true;
    cursorOn = true;
    render();

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
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