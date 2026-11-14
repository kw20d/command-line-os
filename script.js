let canvas = document.querySelector('#main-canvas');
let c = canvas.getContext('2d');
let input = document.querySelector('input');
let renderHistory = [];
let historyIndex = 0;
let currentPath;
let movePrompt = (line) => {
    if(currentPath.parent) c.fillText('~/' + currentPath.parent.value + '/' + currentPath.value + ' >',40,  line + 80)
    else c.fillText('~/' + currentPath.value + ' >',40,  line + 80)
    let num = 12 + line + 40;
    input.style.top = num.toString() + 'px';
};

class folderNode{
    constructor(value){
        this.parent = null;
        this.value = value;
        this.type = null;
        this.left = null;
        this.right = null;
    }
};

let addItem = (tree, parent, value, type, side) => {
    if(parent && parent.type === 'file')
        return
    let node = new tree(value);
    node.parent = parent;
    node.type = type;
    if(parent)
        parent[side] = node;
    return node;
}


let root = addItem(folderNode, null, 'root', 'folder', null);
let folder1 = addItem(folderNode, root, 'folder1', 'folder', 'left');
let folder2 = addItem(folderNode, root, 'folder2', 'folder', 'right');
let file1 = addItem(folderNode, folder1, 'file1', 'file', 'left');

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
    movePrompt(line);
};

let currentFolder = (node) => {
    let path = '';
    if(node.left)
        if(node.left.type === 'file') path += '   ' + node.left.value +'*';
        else path += '   ' + node.left.value;
    if(node.right)
        if(node.right.type === 'file') path += '   ' + node.right.value +'*';
        else path += '   ' + node.right.value;
    if(path === '')
        path = 'empty folder';
    return path;
};

let listContent = () => {
    renderHistory.push(currentFolder(currentPath));
}

let changeDir = txt => {
    if(txt === '..')
    {
        if(currentPath.parent)
            currentPath = currentPath.parent;
        else
            return;
    }
    else if(currentPath.left && txt === currentPath.left.value && currentPath.left.type === 'folder') 
        currentPath = currentPath.left;
    else if(currentPath.right && txt === currentPath.right.value && currentPath.right.type === 'folder') 
        currentPath = currentPath.right;
    else
        renderHistory.push('no such folder');
}

let clearScreen = () => {
    renderHistory = [];
}

let helpCommands = () => {
    let commandsList = ['clear - resets the terminal', 'help - see commands', 'echo - prints', 'whoami - tells you'];
    for(let i = 0; i < commandsList.length; i++)
        renderHistory.push(commandsList[i]);
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
c.font = ('40px monospace');
currentPath = root;
render();

const commands = {
    'help':  () => helpCommands(),
    'clear': () => clearScreen(),
    'echo': (txt) => renderHistory.push(txt.join(" ")),
    'whoami': () => renderHistory.push("Zixted's Fan"),
    'ls': () => listContent(),
    'cd': (txt) => changeDir(txt[0]),
};
let commandHistory = [];
input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        event.preventDefault();    
        if (historyIndex > 0)
        {
            historyIndex--;
            input.value = commandHistory[historyIndex];
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
                return;
            }
            input.value = commandHistory[historyIndex];
        }
    }
     if(event.key === 'Enter')
    {
        if(input.value != '')
        {
                let parts = input.value.trim().split(" ");
                renderHistory.push('> ' + input.value);
                let command = parts[0];
                if(Object.hasOwn(commands, command))
                {
                    commands[command](parts.slice(1));
                }
                else
                {
                    renderHistory.push('command not found: ' + command);
                }
                render();

                commandHistory.push(input.value);
                historyIndex = commandHistory.length;
        }
        input.value='';
    }
});