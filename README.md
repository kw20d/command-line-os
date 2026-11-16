# ZIX-OS

A command-line "operating system" that doubles as my portfolio. Type commands to explore my projects, motion work and contact info.

**Live demo:** <your Netlify link>

![ZIX-OS](intro.gif)

## Try it
`help` · `ls` · `cd projects` · `cat bio.txt` · `open ascii-camera.app` · `color cyan`

## Commands
| Command | What it does |
|---|---|
| `help` | list commands |
| `ls`, `cd`, `pwd` | explore the virtual filesystem |
| `cat <file>` | read a file |
| `open <file>` | open a project or video in a new tab |
| `color <name>` | change the text colour |
| `resume` | open my resume |

## How it's built
- Vanilla JavaScript and HTML Canvas, no libraries
- A tree of nodes (folders and files with parent links) for the filesystem
- A command table that maps command names to functions
- Canvas rendering with scrollback, word wrapping and a blinking cursor
- Intro animation and sound effects

## Credits
Font: VT323 (SIL Open Font License). Intro animation made in After Effects. <add the source of the sound effects if they're not your own>

## Roadmap
Games running inside the terminal, mobile layout, more commands.