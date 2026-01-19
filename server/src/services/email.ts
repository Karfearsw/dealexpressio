import { Resend } from 'resend';

let cachedCredentials: { apiKey: string; fromEmail: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
    if (cachedCredentials && Date.now() < cachedCredentials.expiresAt) {
        return { apiKey: cachedCredentials.apiKey, fromEmail: cachedCredentials.fromEmail };
    }

    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
        ? 'repl ' + process.env.REPL_IDENTITY 
        : process.env.WEB_REPL_RENEWAL 
        ? 'depl ' + process.env.WEB_REPL_RENEWAL 
        : null;

    if (!xReplitToken) {
        throw new Error('Email service configuration error');
    }

    try {
        const response = await fetch(
            'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
            {
                headers: {
                    'Accept': 'application/json',
                    'X_REPLIT_TOKEN': xReplitToken
                }
            }
        );

        if (!response.ok) {
            throw new Error('Email service unavailable');
        }

        const data = await response.json() as { items?: Array<{ settings?: { api_key?: string; from_email?: string } }> };
        const connectionSettings = data.items?.[0];

        if (!connectionSettings?.settings?.api_key) {
            throw new Error('Email service not configured');
        }

        cachedCredentials = {
            apiKey: connectionSettings.settings.api_key,
            fromEmail: connectionSettings.settings.from_email || 'noreply@dealexpress.io',
            expiresAt: Date.now() + CACHE_TTL_MS
        };

        return { apiKey: cachedCredentials.apiKey, fromEmail: cachedCredentials.fromEmail };
    } catch (error) {
        console.error('Email service error');
        throw new Error('Email service unavailable');
    }
}

export async function getResendClient() {
    const { apiKey, fromEmail } = await getCredentials();
    return {
        client: new Resend(apiKey),
        fromEmail
    };
}

export type EmailTemplate = 
    | 'new_account_created'
    | 'signup_welcome'
    | 'subscription_paid'
    | 'payment_confirmed'
    | 'premium_subscription'
    | 'new_lead_added';

interface EmailData {
    to: string;
    firstName: string;
    lastName?: string;
    [key: string]: any;
}

function getEmailSubject(template: EmailTemplate): string {
    const subjects: Record<EmailTemplate, string> = {
        new_account_created: 'Welcome to DealExpress - Your Account is Ready!',
        signup_welcome: 'Welcome to Deal Express - Your Login Credentials',
        subscription_paid: 'Payment Received - DealExpress Subscription',
        payment_confirmed: 'Payment Confirmed - Thank You!',
        premium_subscription: 'Welcome to DealExpress Premium!',
        new_lead_added: 'New Lead Added to Your Pipeline'
    };
    return subjects[template];
}

function getEmailHtml(template: EmailTemplate, data: EmailData): string {
    const { firstName, lastName, ...rest } = data;
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    const baseStyle = `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #ffffff;
        padding: 40px;
        border-radius: 12px;
    `;

    const buttonStyle = `
        display: inline-block;
        background: linear-gradient(90deg, #00d4aa 0%, #007bff 100%);
        color: white;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        margin-top: 20px;
    `;

    const templates: Record<EmailTemplate, string> = {
        new_account_created: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">Deal Express</h1>
                    <p style="color: #888; margin: 5px 0;">Real Estate Wholesaling CRM</p>
                </div>
                <h2 style="color: #ffffff; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
                <p style="color: #cccccc; line-height: 1.6;">
                    Your DealExpress account has been successfully created. You're now ready to start managing your real estate deals like a pro.
                </p>
                <p style="color: #cccccc; line-height: 1.6;">
                    With DealExpress, you can:
                </p>
                <ul style="color: #cccccc; line-height: 1.8;">
                    <li>Track and manage leads through your pipeline</li>
                    <li>Analyze deals with our MAO calculator</li>
                    <li>Generate professional contracts instantly</li>
                    <li>Communicate with buyers and sellers</li>
                    <li>Monitor your business analytics</li>
                </ul>
                <div style="text-align: center;">
                    <a href="https://www.dealexpress.io/dashboard" style="${buttonStyle}">
                        Go to Dashboard
                    </a>
                </div>
                <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
                    If you have any questions, reply to this email or contact support.
                </p>
            </div>
        `,
        signup_welcome: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">Deal Express</h1>
                </div>
                <p style="color: #cccccc; line-height: 1.6;">
                    Dear ${firstName},
                </p>
                <p style="color: #cccccc; line-height: 1.6;">
                    Thank you for signing up for Deal Express — your one-stop shop to wholesale your deals and scale your business.
                </p>
                <p style="color: #cccccc; line-height: 1.6;">
                    Below are your login credentials:
                </p>
                <div style="background: rgba(0,212,170,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #ffffff; margin: 0 0 10px 0;">
                        <strong>Username:</strong> ${rest.username || data.to}
                    </p>
                    <p style="color: #ffffff; margin: 0 0 10px 0;">
                        <strong>Password:</strong> Your password you set during registration
                    </p>
                    <p style="color: #ffffff; margin: 0;">
                        <strong>Team Name Joined:</strong> ${rest.teamName || 'N/A'}
                    </p>
                </div>
                <p style="color: #cccccc; line-height: 1.6;">
                    You can log in anytime to start submitting, managing, and scaling your deals through the platform.
                </p>
                <div style="text-align: center;">
                    <a href="https://www.dealexpress.io/login" style="${buttonStyle}">
                        Log In Now
                    </a>
                </div>
                <p style="color: #cccccc; line-height: 1.6; margin-top: 20px;">
                    If you have any questions or need assistance getting started, feel free to reach out — we're here to help.
                </p>
                <p style="color: #cccccc; line-height: 1.6;">
                    Welcome aboard, and we look forward to working with you.
                </p>
                <p style="color: #cccccc; line-height: 1.6; margin-top: 20px;">
                    Best regards,<br/>
                    <strong style="color: #00d4aa;">The Deal Express Team</strong>
                </p>
            </div>
        `,
        subscription_paid: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">DealExpress</h1>
                    <p style="color: #888; margin: 5px 0;">Payment Received</p>
                </div>
                <h2 style="color: #ffffff;">Thank You, ${fullName}!</h2>
                <p style="color: #cccccc; line-height: 1.6;">
                    We've received your subscription payment. Your account is now active and ready to use.
                </p>
                <div style="background: rgba(0,212,170,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #00d4aa; margin: 0; font-size: 18px;">
                        Subscription: ${rest.tier || 'Standard'} Plan
                    </p>
                    <p style="color: #cccccc; margin: 10px 0 0 0;">
                        Amount: $${rest.amount || '29.99'}
                    </p>
                </div>
                <div style="text-align: center;">
                    <a href="https://www.dealexpress.io/dashboard" style="${buttonStyle}">
                        Start Using DealExpress
                    </a>
                </div>
            </div>
        `,
        payment_confirmed: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">DealExpress</h1>
                    <p style="color: #888; margin: 5px 0;">Payment Confirmed</p>
                </div>
                <h2 style="color: #ffffff;">Payment Successful!</h2>
                <p style="color: #cccccc; line-height: 1.6;">
                    Hi ${fullName}, your payment has been confirmed and processed successfully.
                </p>
                <div style="background: rgba(0,212,170,0.1); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="color: #00d4aa; margin: 0; font-size: 24px; font-weight: bold;">
                        $${rest.amount || '0.00'}
                    </p>
                    <p style="color: #cccccc; margin: 10px 0 0 0;">
                        Transaction ID: ${rest.transactionId || 'N/A'}
                    </p>
                </div>
                <p style="color: #888; font-size: 12px; text-align: center;">
                    A receipt has been sent to your email address.
                </p>
            </div>
        `,
        premium_subscription: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">DealExpress</h1>
                    <p style="color: #ffd700; margin: 5px 0;">Premium Member</p>
                </div>
                <h2 style="color: #ffffff;">Welcome to Premium, ${fullName}!</h2>
                <p style="color: #cccccc; line-height: 1.6;">
                    Congratulations! You now have access to all premium features:
                </p>
                <ul style="color: #cccccc; line-height: 1.8;">
                    <li>Unlimited leads and deals</li>
                    <li>Advanced analytics and reporting</li>
                    <li>Priority customer support</li>
                    <li>Custom contract templates</li>
                    <li>Team collaboration tools</li>
                    <li>API access</li>
                </ul>
                <div style="text-align: center;">
                    <a href="https://www.dealexpress.io/dashboard" style="${buttonStyle}">
                        Explore Premium Features
                    </a>
                </div>
            </div>
        `,
        new_lead_added: `
            <div style="${baseStyle}">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00d4aa; margin: 0;">DealExpress</h1>
                    <p style="color: #888; margin: 5px 0;">New Lead Alert</p>
                </div>
                <h2 style="color: #ffffff;">New Lead Added!</h2>
                <p style="color: #cccccc; line-height: 1.6;">
                    Hi ${fullName}, a new lead has been added to your pipeline.
                </p>
                <div style="background: rgba(0,212,170,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #ffffff; margin: 0; font-weight: bold;">
                        ${rest.leadName || 'New Lead'}
                    </p>
                    <p style="color: #cccccc; margin: 10px 0 0 0;">
                        ${rest.propertyAddress || 'Address pending'}
                    </p>
                    <p style="color: #00d4aa; margin: 10px 0 0 0;">
                        Status: ${rest.status || 'New'}
                    </p>
                </div>
                <div style="text-align: center;">
                    <a href="https://www.dealexpress.io/leads" style="${buttonStyle}">
                        View Lead Details
                    </a>
                </div>
            </div>
        `
    };

    return templates[template];
}

export async function sendEmail(
    template: EmailTemplate,
    data: EmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const { client, fromEmail } = await getResendClient();

        const result = await client.emails.send({
            from: fromEmail,
            to: data.to,
            subject: getEmailSubject(template),
            html: getEmailHtml(template, data)
        });

        if (result.error) {
            console.error('Resend error:', result.error);
            return { success: false, error: result.error.message };
        }

        console.log(`Email sent: ${template} to ${data.to}`);
        return { success: true, messageId: result.data?.id };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

export async function sendWelcomeEmail(
    email: string,
    firstName: string,
    lastName?: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('new_account_created', { to: email, firstName, lastName });
}

export async function sendSubscriptionPaidEmail(
    email: string,
    firstName: string,
    tier: string,
    amount: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('subscription_paid', { to: email, firstName, tier, amount });
}

export async function sendPaymentConfirmedEmail(
    email: string,
    firstName: string,
    amount: string,
    transactionId: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('payment_confirmed', { to: email, firstName, amount, transactionId });
}

export async function sendPremiumSubscriptionEmail(
    email: string,
    firstName: string,
    lastName?: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('premium_subscription', { to: email, firstName, lastName });
}

export async function sendNewLeadEmail(
    email: string,
    firstName: string,
    leadName: string,
    propertyAddress?: string,
    status?: string
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('new_lead_added', { to: email, firstName, leadName, propertyAddress, status });
}

export async function sendSignupWelcomeEmail(
    email: string,
    firstName: string,
    username: string,
    teamName: string | null
): Promise<{ success: boolean; error?: string }> {
    return sendEmail('signup_welcome', { 
        to: email, 
        firstName, 
        username,
        teamName: teamName || 'N/A'
    });
}
