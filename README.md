![ZIX-OS](intro.gif)

![ZIX-OS](intro.gif)

# ZIX-OS

A command-line "operating system" that doubles as my portfolio. Explore my projects, motion work and contact info by typing commands, then launch programs directly inside the terminal.

**Live demo:** [kw20d.github.io/command-line-os](https://kw20d.github.io/command-line-os/)

## Try it

`help` · `ls` · `cd projects` · `cat bio.txt` · `open ascii-camera.app` · `color cyan` · `cd programs` then `start snake` or `start sudoku`

## What's inside

```text
root/
├── projects/    ascii-camera, neverdolist, zoogle
├── about/       bio.txt
    └── contact/    github, instagram, youtube, phtotgraphy, mail
├── motion/      my motion design videos
└── programs/    snake, sudoku
```

## Commands

| Command | What it does |
|---|---|
| `help` | List available commands |
| `ls` | List directory contents |
| `cd <folder>` | Navigate through the virtual filesystem |
| `pwd` | Display the current directory |
| `cat <file>` | Read a file |
| `open <file>` | Open a project or video in a new tab |
| `start <program>` | Launch a program from inside `programs/` |
| `color <name>` | Change the terminal text colour |
| `echo <text>` | Print text to the terminal |
| `whoami` | Display user information |
| `clear` | Clear the terminal |
| `resume` | Open my resume |

## Programs

Programs run directly inside the terminal and take over keyboard input until they are closed.

| Program | Controls |
|---|---|
| [Snake](https://github.com/kw20d/snake-game) | Arrow keys to move, Shift to dash, R to restart, Esc to quit |
| [Sudoku](https://github.com/kw20d/sudoku-game) | Arrow keys to navigate, 1–9 to enter numbers, Backspace to erase, R to restart, Esc to quit |

Each program is an independent JavaScript module with its own repository. The terminal communicates with programs through a simple interface:

- `start(canvas)` — initialize the program.
- `onKey(eventType, key)` — handle keyboard input.
- `stop()` — stop execution and return control to the terminal.

This keeps individual programs modular and makes it easier to add new ones without changing the terminal's core architecture.

## How it's built

- **Vanilla JavaScript and HTML Canvas** — no external libraries or frameworks.
- **Virtual filesystem** — a tree of nodes representing folders and files, with parent references for navigation.
- **Command system** — a command table mapping terminal commands to their respective functions.
- **Terminal rendering** — Canvas-based rendering with scrollback, word wrapping and a blinking cursor.
- **Program interface** — routes keyboard input to the active program and restores terminal control when it exits.
- **Intro animation and sound effects** — adds a little personality to the boot sequence.

## Run it locally

The project uses JavaScript modules, so it needs to run through a local server rather than opening `index.html` directly.

```bash
git clone https://github.com/kw20d/command-line-os.git
cd command-line-os
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

---

Built with curiosity, JavaScript and a terminal-inspired aesthetic.