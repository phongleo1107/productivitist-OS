# productivitist-OS
A local-first, AI-powered productivity tracker inspired by Notion and Steam, featuring Pomodoro, habits, skill trees, EXP, streaks, and daily AI reviews—all while keeping your data private.

## Development

```bash
npm install
npm run dev          # start the app with hot reload
npm run typecheck    # type-check main and renderer
npm run lint         # lint the codebase
```

On Linux systems with SELinux enforcing (e.g. Fedora), Electron's SUID sandbox helper may fail even with correct file permissions. Run dev/preview with the sandbox disabled instead:

```bash
npm run dev -- --noSandbox
npm run start -- --noSandbox
```

## Building

```bash
npm run build         # type-check and build for production
npm run build:win     # package for Windows
npm run build:mac     # package for macOS
npm run build:linux   # package for Linux
```
