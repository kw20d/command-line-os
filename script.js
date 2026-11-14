let canvas = document.querySelector('#main-canvas');
let c = canvas.getContext('2d');
let input = document.querySelector('input');
let renderHistory = [];
let historyIndex = 0;
let nowFolder;
let movePrompt = (line) => {
    if(nowFolder.parent) c.fillText('~/' + nowFolder.parent.value + '/' + nowFolder.value + ' >',40,  line + 80)
    else c.fillText('~/' + nowFolder.value + ' >',40,  line + 80)
    let num = 12 + line + 40;
    input.style.top = num.toString() + 'px';
};

class folderNode{
    constructor(value){
        this.parent = null;
        this.value = value;
        this.children = [];
    }
};

let addItem = (tree, parent, value, type) => {
    if(parent && parent.type === 'file')
        return
    let node = new tree(value);
    node.parent = parent;
    node.type = type;
    if(parent)
        parent.children.push(node);
    return node;
}


let root = addItem(folderNode, null, 'root', 'folder');
let folder1 = addItem(folderNode, root, 'folder1', 'folder');
let folder2 = addItem(folderNode, root, 'folder2', 'folder');
let file1 = addItem(folderNode, folder1, 'file1', 'file');

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

let currentPath = (node) => {
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
    renderHistory.push(currentPath(nowFolder));
}

let changeDir = txt => {
    if(!txt)
    {
        renderHistory.push('enter folder name');
        return;
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
nowFolder = root;
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