import crypto from 'crypto';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase environment variables are missing.' });
  }

  // GET /api/wishes?id=xxxxx
  if (req.method === 'GET') {
    const id = String(req.query?.id || '').trim();

    if (!id) {
      return res.status(400).json({ error: 'Wish ID is required.' });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/wishes?id=eq.${encodeURIComponent(id)}&select=id,student_name,teacher_name,message`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to load wish.' });
    }

    const rows = await response.json();

    if (!rows.length) {
      return res.status(404).json({ error: 'Wish not found.' });
    }

    const row = rows[0];

    return res.status(200).json({
      id: row.id,
      studentName: row.student_name,
      teacherName: row.teacher_name,
      message: row.message,
    });
  }

  // POST /api/wishes
  if (req.method === 'POST') {
    const body = req.body || {};

    const studentName = String(body.studentName || '').trim().slice(0, 80);
    const teacherName = String(body.teacherName || '').trim().slice(0, 80);
    const message = String(body.message || '').trim().slice(0, 1000);

    if (!studentName || !teacherName || !message) {
      return res.status(400).json({
        error: 'Please fill in all fields.',
      });
    }

    const id = crypto.randomBytes(6).toString('base64url');
    const createdAt = new Date().toISOString();

    const response = await fetch(`${supabaseUrl}/rest/v1/wishes`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id,
        student_name: studentName,
        teacher_name: teacherName,
        message,
        created_at: createdAt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error:', errorText);

      return res.status(500).json({
        error: 'Failed to save wish.',
      });
    }

    const base = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

    return res.status(200).json({
      id,
      url: `${base}/wish/${id}`,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed.' });
}
