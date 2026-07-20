import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers for Vercel/Serverless deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subject, message } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable.');
      return res.status(500).json({ error: 'Server configuration error: RESEND_API_KEY is not set' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio OS <onboarding@resend.dev>',
        to: ['kandoiharshitsdlp@gmail.com'],
        reply_to: email.trim(),
        subject: `[Portfolio OS] ${subject ? subject.trim() : 'Direct Message'}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
            <h2 style="color: #c084fc; margin-top: 0; font-size: 20px;">⚡ New Transmission from Portfolio OS</h2>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
            <p style="margin: 8px 0; font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:${email.trim()}" style="color: #38bdf8;">${email.trim()}</a></p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Subject:</strong> ${subject ? subject.trim() : 'No Subject'}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
            <p style="margin-bottom: 8px; font-size: 14px;"><strong>Message Payload:</strong></p>
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; color: #f8fafc; font-size: 14px; border: 1px solid #475569;">
${message.trim()}
            </div>
            <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Transmitted via Harshit Kandoi's Portfolio OS Mail Bridge
            </footer>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(response.status).json({ success: false, error: data });
    }
  } catch (err: any) {
    console.error('Error in send-email API handler:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
