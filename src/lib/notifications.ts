export async function sendLeadNotification({ name, email, phoneNumber, source, assignedTo }: { name: string; email: string; phoneNumber?: string; source: string; assignedTo?: { id: string; name: string; email: string } }) {
  // Send email notification (integrate with SendGrid, etc.)
  await sendEmailNotification({ name, email, phoneNumber, source, assignedTo });
  // Send WhatsApp notification (integrate with Twilio, etc.)
  await sendWhatsAppNotification({ name, email, phoneNumber, source, assignedTo });
}

// Follow-up reminder notifications
export async function sendFollowUpReminderNotification({ 
  reminder, 
  userEmail, 
  userName 
}: { 
  reminder: any; 
  userEmail: string; 
  userName: string; 
}) {
  // Send email notification for follow-up reminder
  await sendFollowUpEmailNotification({ reminder, userEmail, userName });
  // Send WhatsApp notification for follow-up reminder (if phone number is available)
  if (reminder.customerPhoneNumber) {
    await sendFollowUpWhatsAppNotification({ reminder, userEmail, userName });
  }
}

async function sendEmailNotification({ name, email, phoneNumber, source, assignedTo }: { name: string; email: string; phoneNumber?: string; source: string; assignedTo?: { id: string; name: string; email: string } }) {
  // TODO: Integrate with SendGrid, Nodemailer, etc.
  const handlerText = assignedTo ? `\n\n${assignedTo.name} will be in touch with you for your further queries.` : '';
  console.log(`[EMAIL] Welcome ${name} (${email}, ${phoneNumber || 'N/A'}) from ${source}. ${handlerText}`);
}

const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || 'instance126912';
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN || 'm749s4yi6d6i8vwa';

function getUltraMsgCredentials() {
  if (typeof window !== 'undefined') {
    const instanceId = localStorage.getItem('ultramsg_instance_id') || ULTRAMSG_INSTANCE_ID;
    const token = localStorage.getItem('ultramsg_token') || ULTRAMSG_TOKEN;
    return { instanceId, token };
  }
  return { instanceId: ULTRAMSG_INSTANCE_ID, token: ULTRAMSG_TOKEN };
}

async function sendWhatsAppViaUltraMsg({ phoneNumber, message }: { phoneNumber: string; message: string }) {
  const { instanceId, token } = getUltraMsgCredentials();
  if (!instanceId || !token) {
    console.log('[UltraMsg] Missing credentials, skipping real WhatsApp send.');
    return;
  }
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  const formData = new URLSearchParams({
    token,
    to: phoneNumber,
    body: message,
    priority: '10',
  });
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await res.json();
    console.log('[UltraMsg] Response:', data);
  } catch (err) {
    console.error('[UltraMsg] Error sending WhatsApp:', err);
  }
}

async function sendWhatsAppNotification({ name, email, phoneNumber, source, assignedTo }: { name: string; email: string; phoneNumber?: string; source: string; assignedTo?: { id: string; name: string; email: string } }) {
  const handlerText = assignedTo ? `\n\n${assignedTo.name} will be in touch with you for your further queries.` : '';
  const message = `Welcome ${name}! Thank you for your interest. ${handlerText}`;
  if (phoneNumber) {
    await sendWhatsAppViaUltraMsg({ phoneNumber, message });
  } else {
    console.log(`[WHATSAPP] No phone number for ${name}, skipping UltraMsg send.`);
  }
}

async function sendFollowUpEmailNotification({ 
  reminder, 
  userEmail, 
  userName 
}: { 
  reminder: any; 
  userEmail: string; 
  userName: string; 
}) {
  // TODO: Integrate with SendGrid, Nodemailer, etc.
  console.log(`[EMAIL REMINDER] Hi ${userName}, you have a follow-up reminder for ${reminder.customerName}: "${reminder.title}" scheduled for ${new Date(reminder.scheduledFor).toLocaleString()}`);
}

async function sendFollowUpWhatsAppNotification({ 
  reminder, 
  userEmail, 
  userName 
}: { 
  reminder: any; 
  userEmail: string; 
  userName: string; 
}) {
  // For now, just log the notification
  console.log(`[WHATSAPP REMINDER] ${userName}, follow-up reminder: ${reminder.title} for ${reminder.customerName} is due!`);
}