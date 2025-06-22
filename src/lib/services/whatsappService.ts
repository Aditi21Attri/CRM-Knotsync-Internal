import type { WhatsAppConfig } from '@/lib/types';

// WhatsApp service configuration
const whatsappConfig: WhatsAppConfig = {
  provider: 'ultramsg',
  instanceId: process.env.ULTRAMSG_INSTANCE_ID,
  token: process.env.ULTRAMSG_TOKEN,
};

// Get credentials from environment or localStorage
function getWhatsAppCredentials(): { instanceId: string; token: string } | null {
  let instanceId = whatsappConfig.instanceId;
  let token = whatsappConfig.token;

  // Fallback to localStorage for client-side configuration
  if (typeof window !== 'undefined') {
    instanceId = instanceId || localStorage.getItem('ultramsg_instance_id');
    token = token || localStorage.getItem('ultramsg_token');
  }

  if (!instanceId || !token) {
    console.warn('⚠️ [WHATSAPP] UltraMsg credentials not configured. WhatsApp sending will be simulated.');
    return null;
  }

  return { instanceId, token };
}

// WhatsApp message templates
export const whatsappTemplates = {
  leadWelcome: (data: { leadName: string; assignedEmployee?: string }) => {
    const employeeText = data.assignedEmployee ? 
      `${data.assignedEmployee} from our team will be in touch with you shortly! 🤝` : 
      'Our team will be in touch with you shortly! 🤝';
    
    return `Hi ${data.leadName}! 👋

Thank you for your interest in KnotSync services! We're excited to help you achieve your goals. 🚀

${employeeText}

We typically respond within 24 hours and will provide a customized solution for your needs. 

If you have any immediate questions, feel free to reply to this message! 💬

Best regards,
The KnotSync Team ✨`;
  },

  followUpReminder: (data: { employeeName: string; customerName: string; reminderTitle: string; scheduledTime: string }) => {
    return `🔔 Hi ${data.employeeName}!

Follow-up reminder: "${data.reminderTitle}" for ${data.customerName} is due (${data.scheduledTime}). 

Please contact them soon! 📞

- KnotSync CRM`;
  },

  customerFollowUp: (data: { customerName: string; employeeName: string; companyName?: string }) => {
    const company = data.companyName || 'KnotSync';
    return `Hi ${data.customerName}! 👋

This is ${data.employeeName} from ${company}. 

I wanted to follow up on our previous conversation. How can I help you today? 

Feel free to ask any questions! 😊

Best regards,
${data.employeeName}`;
  }
};

// Validate and clean phone number
export function validateAndCleanPhoneNumber(phoneNumber: string): { isValid: boolean; cleanNumber: string; formattedNumber: string } {
  // Remove all non-numeric characters except +
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // If number doesn't start with +, try to add country code
  if (!cleanNumber.startsWith('+')) {
    // If it looks like a US number (10 digits), add +1
    if (cleanNumber.length === 10 && cleanNumber.match(/^\d{10}$/)) {
      cleanNumber = '+1' + cleanNumber;
    }
    // If it looks like an Indian number (10 digits starting with 6-9), add +91
    else if (cleanNumber.length === 10 && cleanNumber.match(/^[6-9]\d{9}$/)) {
      cleanNumber = '+91' + cleanNumber;
    }
    // For other cases, try adding +1 as default
    else if (cleanNumber.length >= 10) {
      cleanNumber = '+' + cleanNumber;
    }
  }

  // Check if it's a valid length (at least 10 digits including country code)
  const digitCount = cleanNumber.replace(/[^\d]/g, '').length;
  const isValid = digitCount >= 10 && digitCount <= 15 && cleanNumber.startsWith('+');

  // Format for display
  const formattedNumber = cleanNumber;

  return { isValid, cleanNumber, formattedNumber };
}

// Send WhatsApp message via UltraMsg
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  retries = 3
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  console.log(`💬 [WHATSAPP SERVICE] Attempting to send WhatsApp to: ${phoneNumber}`);
  console.log(`💬 [WHATSAPP SERVICE] Message: ${message}`);

  // Validate phone number
  const { isValid, cleanNumber } = validateAndCleanPhoneNumber(phoneNumber);
  if (!isValid) {
    const error = `Invalid phone number format: ${phoneNumber}`;
    console.error(`❌ [WHATSAPP SERVICE] ${error}`);
    return { success: false, error };
  }

  // Get credentials
  const credentials = getWhatsAppCredentials();
  if (!credentials) {
    console.log(`💬 [WHATSAPP SERVICE] Simulating WhatsApp send (no credentials configured)`);
    console.log(`💬 [WHATSAPP SERVICE] TO: ${cleanNumber}`);
    console.log(`💬 [WHATSAPP SERVICE] MESSAGE: ${message}`);
    return { success: true, messageId: 'simulated-' + Date.now() };
  }

  const { instanceId, token } = credentials;
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const formData = new URLSearchParams({
        token,
        to: cleanNumber,
        body: message,
        priority: '10',
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      
      console.log(`💬 [WHATSAPP SERVICE] UltraMsg response:`, data);

      if (data.sent === 'true' || data.sent === true) {
        console.log(`✅ [WHATSAPP SERVICE] WhatsApp sent successfully to ${cleanNumber}`);
        return { success: true, messageId: data.id || 'ultramsg-' + Date.now() };
      } else {
        const error = data.error || data.message || 'Unknown error from UltraMsg';
        console.error(`❌ [WHATSAPP SERVICE] Attempt ${attempt} failed for ${cleanNumber}:`, error);
        
        if (attempt === retries) {
          return { success: false, error };
        }
      }
    } catch (error: any) {
      console.error(`❌ [WHATSAPP SERVICE] Attempt ${attempt} network error for ${cleanNumber}:`, error.message);
      
      if (attempt === retries) {
        return { success: false, error: error.message };
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Test WhatsApp configuration
export async function testWhatsAppConfig(): Promise<{ success: boolean; error?: string; instanceInfo?: any }> {
  const credentials = getWhatsAppCredentials();
  if (!credentials) {
    return { success: false, error: 'UltraMsg credentials not configured' };
  }

  const { instanceId, token } = credentials;
  const url = `https://api.ultramsg.com/${instanceId}/instance/status`;

  try {
    const formData = new URLSearchParams({ token });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    
    if (data.account_status === 'authenticated') {
      console.log('✅ [WHATSAPP SERVICE] UltraMsg configuration verified successfully');
      return { success: true, instanceInfo: data };
    } else {
      console.error('❌ [WHATSAPP SERVICE] UltraMsg instance not authenticated:', data);
      return { success: false, error: 'Instance not authenticated', instanceInfo: data };
    }
  } catch (error: any) {
    console.error('❌ [WHATSAPP SERVICE] UltraMsg configuration test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Set credentials (for admin configuration)
export function setWhatsAppCredentials(instanceId: string, token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ultramsg_instance_id', instanceId);
    localStorage.setItem('ultramsg_token', token);
    console.log('✅ [WHATSAPP SERVICE] Credentials saved to localStorage');
  }
}

// Clear credentials
export function clearWhatsAppCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ultramsg_instance_id');
    localStorage.removeItem('ultramsg_token');
    console.log('✅ [WHATSAPP SERVICE] Credentials cleared from localStorage');
  }
}
