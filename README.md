# Terminal Portfolio

> An interactive developer resume that runs in the browser as a terminal emulator. Type commands to explore experience, skills, projects, and more.

[![behance](https://img.shields.io/badge/behance-1769FF?style=for-the-badge&logo=behance&logoColor=white)](https://www.behance.net/ingfranciscastillo)
[![github_stars](https://img.shields.io/github/stars/ingfranciscastillo/ai-resume-analyzer?style=for-the-badge)](https://github.com/ingfranciscastillo/resume-terminal-json/stargazers)
[![license](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![linkedin](https://img.shields.io/badge/linkedin-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ingfranciscastillo)
[![last_commit](https://img.shields.io/github/last-commit/ingfranciscastillo/ai-resume-analyzer?style=for-the-badge)](https://github.com/ingfranciscastillo/resume-terminal-json/commits/main)

![Preview](/screenshots/Help%20Menu.jpeg)

---

## Features

- **Interactive Terminal** — Real shell experience with autocomplete, history, and command parsing
- **Live Resume Data** — Powered by [JSON Resume](https://jsonresume.org/) schema
- **5 Themes** — dark (default), light, matrix, hacker, dracula
- **Keyboard Shortcuts** — Tab autocomplete, ↑/↓ history, Ctrl+L clear
- **Download Resume** — Export as JSONResume-compatible file

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm/bun/yarn)

### Installation

```bash
git clone https://github.com/ingfranciscastillo/resume-terminal-json.git
cd resume-terminal-json
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

---

## Commands Reference

### Info Commands

| Command | Description                 |
| ------- | --------------------------- |
| `help`  | Show all available commands |
| `about` | Who am I?                   |

### Portfolio Commands

| Command          | Description                                        |
| ---------------- | -------------------------------------------------- |
| `about`          | Who am I? Basic info, summary                      |
| `contact`        | Email, phone, location, social profiles            |
| `skills`         | Technical skills grouped by category with keywords |
| `work`           | Work experience with highlights                    |
| `projects`       | Side projects and open source                      |
| `education`      | Education history and courses                      |
| `certificates`   | Professional certifications                        |
| `languages`      | Spoken languages and fluency                       |
| `resume`         | Download resume.json file                          |
| `open <project>` | Open a project URL in new tab                      |

### System Commands

| Command        | Description                                         |
| -------------- | --------------------------------------------------- |
| `theme <name>` | Switch theme (dark, light, matrix, hacker, dracula) |
| `clear`        | Clear terminal screen                               |
| `whoami`       | Current user (from resume)                          |
| `date`         | Current date and time                               |
| `echo <text>`  | Echo text back                                      |

### Keyboard Shortcuts

| Shortcut  | Action               |
| --------- | -------------------- |
| `Tab`     | Autocomplete command |
| `↑` / `↓` | Command history      |
| `Ctrl+L`  | Clear screen         |
| `Enter`   | Execute command      |

---

## Data Structure

Resume data is stored in `app/data/resume.json` following the [JSON Resume](https://jsonresume.org/schema/) schema v1.0.0.

```json
{
  "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
  "basics": {
    "name": "Your Name",
    "label": "Your Title",
    "email": "you@example.com",
    "summary": "Brief summary...",
    "location": { "city": "...", "countryCode": "..." },
    "profiles": [{ "network": "GitHub", "url": "..." }]
  },
  "work": [...],
  "skills": [...],
  "projects": [...],
  "education": [...],
  "certificates": [...],
  "languages": [...]
}
```

### Editing Your Resume

1. Edit `app/data/resume.json` with your information
2. Build must follow JSON Resume schema
3. Run `resume` command in terminal to download updated JSON
4. Submit to job applications with schema reference

---

## Theme System

Five themes available via `theme <name>` command:

| Theme     | Description                               |
| --------- | ----------------------------------------- |
| `dark`    | Default green-on-black (hacker aesthetic) |
| `light`   | Light mode for daytime viewing            |
| `matrix`  | Classic green matrix rain effect          |
| `hacker`  | Amber CRT terminal                        |
| `dracula` | Dracula purple color scheme               |

Each theme includes:

- Custom color palette (background, foreground, accents)
- Terminal-specific tokens (prompt, user, path, cursor colors)
- Optional CRT scanlines for matrix/hacker themes
- Glow effects where appropriate

---

## Architecture

```
app/
├── components/
│   ├── Terminal.tsx        # Main terminal component
│   ├── BootSequence.tsx    # Boot animation
│   └── TerminalLine.tsx    # Line renderer
├── lib/
│   ├── commands.ts        # Command registry and handlers
│   ├── formatter.ts       # Output formatting (colors, links)
│   ├── themes.ts         # Theme system and switching
│   ├── suggest.ts       # Autocomplete suggestions
│   ├── history.ts       # Command history persistence
│   └── utils.ts         # Utility functions
├── data/
│   └── resume.json     # Resume data (JSON Resume schema)
└── app.css            # Tailwind CSS v4 + design tokens
```

### Key Files

- `commands.ts` — Command registry; add new commands here
- `themes.ts` — Theme definitions and switching logic
- `formatter.ts` — Color schemes and text styling
- `app.css` — CSS custom properties for themes

---

## Tech Stack

- **Framework** — [React Router](https://reactrouter.com/) v7
- **Styling** — [Tailwind CSS](https://tailwindcss.com/) v4
- **Font** — [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

---

## Support

If you find this project useful, consider supporting my work!

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-violet.png)](https://www.buymeacoffee.com/ingfranciscastillo)

---

## License

MIT License — feel free to use this as a template for your own terminal portfolio.
