# Teacher's Day Card 💌

A tiny real web app for creating a Teacher's Day wish and sharing a unique invitation link. No teacher account and no email service are required.

## What it does

1. Student opens `/` and writes their name, teacher name and wish.
2. Server saves the wish in SQLite and creates a random URL such as `/wish/a8K2x91`.
3. Student copies the URL or uses the device's native Share sheet (LINE / Messenger / Messages / etc.).
4. Teacher opens the link and gets the animated card on Page 2.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm start
```

Then open http://localhost:3000

## Deploy

This app needs a server and persistent disk because it uses SQLite. Render / Railway / Fly.io with a persistent volume are suitable. Set `PORT` automatically if the platform provides it. Optional `DB_PATH` can point to the mounted persistent disk, e.g. `/data/data.sqlite`.

Do **not** deploy this as a purely static site if you want the generated links to work across devices.

## Design

The supplied UI screenshots are kept in `public/assets/` as the visual reference/background for this fast MVP. The interactive form, animation, data layer and responsive layout are built on top of that visual direction.
