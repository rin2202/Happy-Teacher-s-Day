const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'data.sqlite'));

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS wishes (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

app.post('/api/wishes', (req, res) => {
  const studentName = clean(req.body.studentName, 80);
  const teacherName = clean(req.body.teacherName, 80);
  const message = clean(req.body.message, 1000);

  if (!studentName || !teacherName || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  const id = crypto.randomBytes(6).toString('base64url');
  const createdAt = new Date().toISOString();
  db.prepare(`INSERT INTO wishes (id, student_name, teacher_name, message, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, studentName, teacherName, message, createdAt);

  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ id, url: `${base}/wish/${id}` });
});

app.get('/api/wishes/:id', (req, res) => {
  const row = db.prepare(`SELECT id, student_name AS studentName, teacher_name AS teacherName, message FROM wishes WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Wish not found.' });
  res.json(row);
});

app.get('/wish/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wish.html'));
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Teacher Day Card running on http://localhost:${PORT}`));
