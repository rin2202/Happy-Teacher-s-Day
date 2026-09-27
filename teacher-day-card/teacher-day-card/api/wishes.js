const crypto = require('crypto');

module.exports = async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Supabase environment variables are missing.'
    });
  }

  if (req.method === 'GET') {
    const id = String(req.query?.id || '').trim();

    if (!id) {
      return res.status(400).json({
        error: 'Wish ID is required.'
      });
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/wishes?share_token=eq.${encodeURIComponent(id)}&select=id,share_token,sender_name,teacher_name,message`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase GET error:', errorText);

        return res.status(500).json({
          error: 'Failed to load wish.'
        });
      }

      const rows = await response.json();

      if (!rows.length) {
        return res.status(404).json({
          error: 'Wish not found.'
        });
      }

      const row = rows[0];

      return res.status(200).json({
        id: row.share_token,
        studentName: row.sender_name,
        teacherName: row.teacher_name,
        message: row.message
      });

    } catch (error) {
      console.error('GET error:', error);

      return res.status(500).json({
        error: 'Failed to load wish.'
      });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};

    const studentName = String(body.studentName || '').trim().slice(0, 80);
    const teacherName = String(body.teacherName || '').trim().slice(0, 80);
    const message = String(body.message || '').trim().slice(0, 1000);

    if (!studentName || !teacherName || !message) {
      return res.status(400).json({
        error: 'Please fill in all fields.'
      });
    }

    try {
      const shareToken = crypto.randomBytes(6).toString('hex');

      const response = await fetch(
        `${supabaseUrl}/rest/v1/wishes`,
        {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            share_token: shareToken,
            sender_name: studentName,
            teacher_name: teacherName,
            message
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase POST error:', errorText);

        return res.status(500).json({
          error: 'Failed to save wish.'
        });
      }

      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;

      return res.status(200).json({
        id: shareToken,
        url: `${protocol}://${host}/wish/${shareToken}`
      });

    } catch (error) {
      console.error('POST error:', error);

      return res.status(500).json({
        error: 'Failed to save wish.'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);

  return res.status(405).json({
    error: 'Method not allowed.'
  });
};
