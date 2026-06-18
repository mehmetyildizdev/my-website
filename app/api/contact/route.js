import { sendEmail } from '@/lib/mailer';

export async function POST(req) {
    const { name, email, message, token } = await req.json();

    if (!name || !email || !message) {
        return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    if (!token) {
        return new Response(JSON.stringify({ message: 'Captcha token is missing' }), { status: 400 });
    }

    try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            return new Response(JSON.stringify({ message: 'Invalid captcha verification' }), { status: 400 });
        }

        await sendEmail({ name, email, message });

        return new Response(JSON.stringify({ message: 'Email sent successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}