//
let canvas = document.querySelector('#main-canvas');
let c = canvas.getContext('2d');
let input = document.querySelector('input');
let i, num, line;
let printCommand = (line) => c.fillText(input.value, 100, line);
let printOutput = (text, line) => c.fillText(text, 100, line + 40);
let movePrompt = (line) => {
    c.fillText('>',40,  line + 80)
    num = 12 + line + 40;
    input.style.top = num.toString() + 'px';
};
let printOnCanvas = (text) => {
    line = i * 80;
    printCommand(line)
    printOutput(text, line);
    movePrompt(line);
    i++;
};

let canvasReset = () => {
    i = 1;
    input.style.top = '48px';
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'black';
    c.fillRect(0,0,canvas.width,canvas.height);
    c.fillStyle = 'green';
    c.fillText('>',40, 80)
}

let helpCommands = () => {
    printOnCanvas('clear - resets the terminal  help - see commands');
}

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
c.font = ('40px monospace');
canvasReset();

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
});

let commandHistory = [];
input.addEventListener('keypress', (event) => {
    if(event.key === 'Enter')
    {
        if(input.value != '')
        {
                let command = input.value.split(" ")[0];
                switch(command) {
                    case 'help':
                        helpCommands();
                        break;
                    case 'clear':
                        canvasReset();
                        break;
                    case 'echo':
                        let words = '';
                        for(let p = 1; p < input.value.split(" ").length; p++)
                        {
                                words += ' ' + input.value.split(" ")[p];
                        };
                        printOnCanvas(words);
                        break;
                    default:
                        printOnCanvas('command not found: ' + input.value);
                        break;
                }
                commandHistory.push(input.value);
                k = 1;
        }
        input.value='';
    }
});
