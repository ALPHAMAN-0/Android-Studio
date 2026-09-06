# Android_Studio

Commands run from `Unlimitade Storage/` (the only subproject; repo root has no manifest):
- Dev: `npm run dev` (vite)
- Build: `npm run build` (tsc && vite build)
- Preview: `npm run preview` (vite preview)
- Android sync: `npm run cap:sync` (npx cap sync android)
- Android open: `npm run cap:open` (npx cap open android)
- Android run: `npm run cap:run` (npx cap run android)

No test or lint script is defined in Unlimitade Storage/package.json.

Files worth reading first:
- Unlimitade Storage/src/App.tsx — route table and layout
- Unlimitade Storage/src/main.tsx — bootstrap order (DB init before render)
- Unlimitade Storage/package.json — scripts and dependency set

Architecture: see ARCHITECTURE.md — read before structural changes
