// Email service configuration
const emailConfig = {
  provider: 'nodemailer' as const,
  fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@knotsync.com',
  fromName: process.env.SMTP_FROM_NAME || 'KnotSync CRM',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
};

// Dynamic import of nodemailer to avoid build issues
let transporter: any = null;

async function createTransporter() {
  if (typeof window !== 'undefined') {
    console.warn('⚠️ [EMAIL] Email service should only be used server-side');
    return null;
  }

  if (!emailConfig.smtpUser || !emailConfig.smtpPass) {
    console.warn('⚠️ [EMAIL] SMTP credentials not configured. Email sending will be simulated.');
    return null;
  }
  try {
    const nodemailer = await import('nodemailer');
    
    return nodemailer.default.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
      tls: {
        rejectUnauthorized: false // For development. Set to true in production with valid SSL.
      }
    });
  } catch (error) {
    console.error('❌ [EMAIL] Failed to create transporter:', error);
    return null;
  }
}

// Initialize transporter
async function getTransporter() {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
}

// Email templates
export const emailTemplates = {
  leadAssigned: (data: { employeeName: string; leadName: string; leadEmail: string; leadPhone?: string; source: string }) => ({
    subject: `🎯 New Lead Assigned: ${data.leadName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">🎯 New Lead Assigned</h2>
          <p style="font-size: 16px; color: #333;">Hi ${data.employeeName},</p>
          <p style="color: #666;">You have been assigned a new lead. Please follow up as soon as possible:</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Lead Details:</h3>
            <p><strong>📝 Name:</strong> ${data.leadName}</p>
            <p><strong>📧 Email:</strong> ${data.leadEmail}</p>
            <p><strong>📞 Phone:</strong> ${data.leadPhone || 'Not provided'}</p>
            <p><strong>🌐 Source:</strong> ${data.source}</p>
            <p><strong>⏰ Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #065f46; margin: 0;"><strong>💡 Tip:</strong> Quick response times significantly improve conversion rates!</p>
          </div>
          
          <p style="color: #666;">Best regards,<br>KnotSync CRM System</p>
        </div>
      </div>
    `,
    text: `Hi ${data.employeeName},

You have been assigned a new lead:

Name: ${data.leadName}
Email: ${data.leadEmail}
Phone: ${data.leadPhone || 'Not provided'}
Source: ${data.source}
Received: ${new Date().toLocaleString()}

Please follow up with this lead as soon as possible.

Best regards,
KnotSync CRM System`
  }),

  leadWelcome: (data: { leadName: string; assignedEmployee?: string; source: string }) => ({
    subject: `Welcome ${data.leadName}! Thank you for your interest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">🎉 Welcome to KnotSync!</h2>
          <p style="font-size: 16px; color: #333;">Hi ${data.leadName},</p>
          <p style="color: #666;">Thank you for your interest in our services! We're excited to help you achieve your goals.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What happens next?</h3>
            ${data.assignedEmployee ? 
              `<p>🤝 <strong>${data.assignedEmployee}</strong> from our team will be in touch with you shortly to discuss your requirements.</p>` :
              `<p>🤝 Our team will be in touch with you shortly to discuss your requirements.</p>`
            }
            <p>📞 We typically respond within 24 hours</p>
            <p>💼 We'll provide a customized solution for your needs</p>
          </div>
          
          <p style="color: #666;">If you have any immediate questions, please don't hesitate to reach out.</p>
          <p style="color: #666;">Best regards,<br>The KnotSync Team</p>
        </div>
      </div>
    `,
    text: `Hi ${data.leadName},

Thank you for your interest in our services! We're excited to help you achieve your goals.

${data.assignedEmployee ? 
  `${data.assignedEmployee} from our team will be in touch with you shortly to discuss your requirements.` :
  'Our team will be in touch with you shortly to discuss your requirements.'
}

If you have any immediate questions, please don't hesitate to reach out.

Best regards,
The KnotSync Team`
  }),

  followUpReminder: (data: { employeeName: string; customerName: string; reminderTitle: string; description?: string; scheduledTime: string; customerEmail?: string; customerPhone?: string }) => ({
    subject: `⏰ Follow-up Reminder: ${data.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; margin-bottom: 20px;">⏰ Follow-up Reminder</h2>
          <p style="font-size: 16px; color: #333;">Hi ${data.employeeName},</p>
          <p style="color: #666;">You have a follow-up reminder due:</p>
          
          <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7f1d1d; margin-top: 0;">Reminder Details:</h3>
            <p><strong>👤 Customer:</strong> ${data.customerName}</p>
            <p><strong>📝 Title:</strong> ${data.reminderTitle}</p>
            ${data.description ? `<p><strong>📄 Description:</strong> ${data.description}</p>` : ''}
            <p><strong>⏰ Scheduled for:</strong> ${data.scheduledTime}</p>
            ${data.customerEmail ? `<p><strong>📧 Email:</strong> ${data.customerEmail}</p>` : ''}
            ${data.customerPhone ? `<p><strong>📞 Phone:</strong> ${data.customerPhone}</p>` : ''}
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0;"><strong>⚡ Action Required:</strong> Please contact this customer as scheduled to maintain good relationships!</p>
          </div>
          
          <p style="color: #666;">Best regards,<br>KnotSync CRM System</p>
        </div>
      </div>
    `,
    text: `Hi ${data.employeeName},

You have a follow-up reminder due:

Customer: ${data.customerName}
Title: ${data.reminderTitle}
${data.description ? `Description: ${data.description}` : ''}
Scheduled for: ${data.scheduledTime}
${data.customerEmail ? `Email: ${data.customerEmail}` : ''}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}

Please follow up with this customer as scheduled.

Best regards,
KnotSync CRM System`
  })
};

// Send email function
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  retries = 3
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  console.log(`📧 [EMAIL SERVICE] Attempting to send email to: ${to}`);
  console.log(`📧 [EMAIL SERVICE] Subject: ${subject}`);
  // If no transporter is available (missing credentials), simulate sending
  const emailTransporter = await getTransporter();
  if (!emailTransporter) {
    console.log(`📧 [EMAIL SERVICE] Simulating email send (no SMTP configured)`);
    console.log(`📧 [EMAIL SERVICE] TO: ${to}`);
    console.log(`📧 [EMAIL SERVICE] SUBJECT: ${subject}`);
    console.log(`📧 [EMAIL SERVICE] CONTENT: ${text}`);
    return { success: true, messageId: 'simulated-' + Date.now() };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await emailTransporter.sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
      });

      console.log(`✅ [EMAIL SERVICE] Email sent successfully to ${to}`);
      console.log(`📧 [EMAIL SERVICE] Message ID: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`❌ [EMAIL SERVICE] Attempt ${attempt} failed for ${to}:`, error.message);
      
      if (attempt === retries) {
        return { success: false, error: error.message };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Test email configuration
export async function testEmailConfig(): Promise<{ success: boolean; error?: string }> {
  const emailTransporter = await getTransporter();
  if (!emailTransporter) {
    return { success: false, error: 'SMTP credentials not configured' };
  }

  try {
    await emailTransporter.verify();
    console.log('✅ [EMAIL SERVICE] SMTP configuration verified successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [EMAIL SERVICE] SMTP configuration failed:', error.message);
    return { success: false, error: error.message };
  }
}
