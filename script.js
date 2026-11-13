//Gets the canvas
let canvas = document.querySelector('#main-canvas');
//Gets its context
let c = canvas.getContext('2d');
//Gets the input
let input = document.querySelector('input');
//Needed Variables Declaration
let renderHistory = [];
//Helper Functions
let movePrompt = (line) => {
    c.fillText('>',40,  line + 80)
    let num = 12 + line + 40;
    input.style.top = num.toString() + 'px';
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
    movePrompt(line);
};

let clearScreen = () => {
    renderHistory = [];
}

let helpCommands = () => {
    let commandsList = ['clear - resets the terminal', 'help - see commands', 'echo - prints', 'whoami - tells you'];
    for(let i = 0; i < commandsList.length; i++)
        renderHistory.push(commandsList[i]);
}

//Setting the canvas size to the window
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
//Setting the starting style
c.font = ('40px monospace');
 render();

const commands = {
    'help':  () => helpCommands(),
    'clear': () => clearScreen(),
    'echo': (txt) => renderHistory.push(txt.join(" ")),
    'whoami': () => renderHistory.push("Zixted's Fan"),
};
let commandHistory = [];
let k = 1;
input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.length === 0)
            return;
        if (typeof commandHistory[commandHistory.length - k] === "undefined")
            return;
        input.value = commandHistory[commandHistory.length - k];
        k++;
    }
    else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if(k <= 1)
            {input.value = '';
            return;}
        k--;
        if (commandHistory.length === 0)
            return;
        
        if (typeof commandHistory[commandHistory.length - k] === "undefined")
            return;
        input.value = commandHistory[commandHistory.length - k];
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
                k = 1;
        }
        input.value='';
    }
});