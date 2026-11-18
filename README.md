![ZIX-OS](intro.gif)

# ZIX-OS

A command-line "operating system" that doubles as my portfolio. Explore my projects, motion work and contact info by typing commands, then play a game.

**Live demo:** [kw20d.github.io/command-line-os](https://kw20d.github.io/command-line-os/)

## Try it

`help` · `ls` · `cd projects` · `cat bio.txt` · `open ascii-camera.app` · `color cyan` · `cd games` then `start snake` or `start sudoku`

## What's inside

```text
root/
├── projects/   ascii-camera, neverdolist, zoogle (open them in a new tab)
├── about/      bio.txt, contact.txt
├── motion/     my motion design videos
└── games/      snake, sudoku
```

## Commands

| Command | What it does |
|---|---|
| `help` | list commands |
| `ls`, `cd <folder>`, `pwd` | explore the virtual filesystem |
| `cat <file>` | read a file |
| `open <file>` | open a project or video in a new tab |
| `start <game>` | play a game (from inside `games/`) |
| `color <name>` | change the text colour |
| `echo`, `whoami`, `clear` | the usual |
| `resume` | open my resume |

## Games

Games run inside the terminal and take over the keyboard until you quit.

| Game | Controls |
|---|---|
| [Snake](https://github.com/kw20d/snake-game) | Arrow keys to move, Shift to dash, R to restart, Esc to quit |
| [Sudoku](https://github.com/kw20d/sudoku-game) | Arrow keys to navigate, 1–9 to enter numbers, Backspace to erase, R to restart, Esc to quit |

Each game is its own module and its own repo. The terminal only needs a `start`, `onKey` and `stop` from it.

## How it's built

- Vanilla JavaScript and HTML Canvas, no libraries
- A tree of nodes (folders and files with parent links) for the filesystem
- A command table that maps command names to functions
- Canvas rendering with scrollback, word wrapping and a blinking cursor
- A small program interface: while a game runs, the terminal routes every key to it and gives the screen back when it quits
- Intro animation and sound effects

## Run it locally

The code uses JavaScript modules, so open it through a local server instead of opening `index.html` directly:

```bash
git clone https://github.com/kw20d/command-line-os.git
cd command-line-os
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.