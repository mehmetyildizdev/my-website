import nodemailer from 'nodemailer';

export async function POST(req) {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
        return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587, // Use 587 for TLS, 465 for SSL
            secure: false, // Set to true if using port 465
            auth: {
                user: process.env.MAILGUN_SMTP_LOGIN, // Mailgun SMTP login
                pass: process.env.MAILGUN_SMTP_PASSWORD, // Mailgun SMTP password
            },
        });

        const mailOptions = {
            from: 'admin@mehmetyildiz.dev',
            to: 'web@mehmetyildiz.dev',
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        await transporter.sendMail(mailOptions);

        return new Response(JSON.stringify({ message: 'Email sent successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}