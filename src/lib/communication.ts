import type { Customer } from '@/lib/types';

// Note: toast should be passed from the component using this utility
export const communicationUtils = {  sendEmail: (customer: Customer, toast?: any, subject?: string, body?: string) => {
    const defaultSubject = 'Follow-up from CRM';
    const defaultBody = `Hi ${customer.name},\n\nI hope this message finds you well.\n\nBest regards`;
    
    const emailSubject = encodeURIComponent(subject || defaultSubject);
    const emailBody = encodeURIComponent(body || defaultBody);
    
    try {
      window.open(`mailto:${customer.email}?subject=${emailSubject}&body=${emailBody}`, '_blank');
      
      if (toast) {
        toast({
          title: "Email Client Opened",
          description: `Preparing email for ${customer.name} (${customer.email})`,
        });
      }
      
      // Log the communication activity
      communicationUtils.logCommunication(customer, 'email', true);
      
      console.log(`Email client opened for ${customer.name} (${customer.email})`);
      return true;
    } catch (error) {
      if (toast) {
        toast({
          title: "Error",
          description: "Unable to open email client. Please check if you have an email application installed.",
          variant: "destructive",
        });
      } else {
        alert('Unable to open email client. Please check if you have an email application installed.');
      }
      
      // Log the failed communication activity
      communicationUtils.logCommunication(customer, 'email', false);
      
      return false;
    }
  },sendWhatsApp: (customer: Customer, toast?: any, message?: string) => {
    if (!customer.phoneNumber) {
      if (toast) {
        toast({
          title: "Phone Number Missing",
          description: `No phone number available for ${customer.name}. Please add a phone number to send WhatsApp messages.`,
          variant: "destructive",
        });
      } else {
        alert(`No phone number available for ${customer.name}. Please add a phone number to send WhatsApp messages.`);
      }
      return false;
    }
    
    const defaultMessage = `Hi ${customer.name}, thank you for your interest in our services. How can I help you today?`;
    const whatsappMessage = encodeURIComponent(message || defaultMessage);
    
    // Clean phone number - remove any non-numeric characters except +
    const cleanPhone = customer.phoneNumber.replace(/[^\d+]/g, '');
    
    if (cleanPhone.length < 10) {
      if (toast) {
        toast({
          title: "Invalid Phone Number",
          description: `Invalid phone number format for ${customer.name}. Please check the phone number.`,
          variant: "destructive",
        });
      } else {
        alert(`Invalid phone number format for ${customer.name}. Please check the phone number.`);
      }
      return false;
    }
    
    try {      window.open(`https://wa.me/${cleanPhone}?text=${whatsappMessage}`, '_blank');
      
      if (toast) {
        toast({
          title: "WhatsApp Opened",
          description: `Opening WhatsApp chat with ${customer.name} (${customer.phoneNumber})`,
        });
      }
      
      // Log the communication activity
      communicationUtils.logCommunication(customer, 'whatsapp', true);
      
      console.log(`WhatsApp opened for ${customer.name} (${customer.phoneNumber})`);
      return true;
    } catch (error) {
      if (toast) {
        toast({
          title: "Error",
          description: "Unable to open WhatsApp. Please check if WhatsApp is installed or accessible in your browser.",
          variant: "destructive",
        });      } else {
        alert('Unable to open WhatsApp. Please check if WhatsApp is installed or accessible in your browser.');
      }
      
      // Log the failed communication activity
      communicationUtils.logCommunication(customer, 'whatsapp', false);
      
      return false;
    }
  },  makeCall: (customer: Customer, toast?: any) => {
    if (!customer.phoneNumber) {
      if (toast) {
        toast({
          title: "Phone Number Missing",
          description: `No phone number available for ${customer.name}. Please add a phone number to make calls.`,
          variant: "destructive",
        });
      } else {
        alert(`No phone number available for ${customer.name}. Please add a phone number to make calls.`);
      }
      return false;
    }
    
    // Confirm before making the call
    const confirmCall = confirm(`Do you want to call ${customer.name} at ${customer.phoneNumber}?`);
    if (!confirmCall) {
      return false;
    }
    
    try {
      window.open(`tel:${customer.phoneNumber}`, '_self');
        if (toast) {
        toast({
          title: "Call Initiated",
          description: `Calling ${customer.name} at ${customer.phoneNumber}`,
        });
      }
      
      // Log the communication activity
      communicationUtils.logCommunication(customer, 'call', true);
      
      console.log(`Call initiated for ${customer.name} (${customer.phoneNumber})`);
      return true;
    } catch (error) {
      if (toast) {
        toast({
          title: "Error",
          description: "Unable to initiate call. Please check if your device supports phone calls.",
          variant: "destructive",
        });      } else {
        alert('Unable to initiate call. Please check if your device supports phone calls.');
      }
      
      // Log the failed communication activity
      communicationUtils.logCommunication(customer, 'call', false);
      
      return false;
    }
  },

  // Helper function to create custom messages
  createEmailMessage: (customer: Customer, customSubject?: string, customBody?: string) => {
    const subject = customSubject || `Follow-up with ${customer.name}`;
    const body = customBody || `Hi ${customer.name},\n\nI wanted to follow up on your inquiry. Please let me know if you have any questions.\n\nBest regards,\n[Your Name]`;
    return { subject, body };
  },

  createWhatsAppMessage: (customer: Customer, customMessage?: string) => {
    return customMessage || `Hi ${customer.name}! 👋 Thank you for your interest in our services. I'm here to help with any questions you might have. What would you like to know more about?`;
  },

  // Utility to log communication activity (for future analytics)
  logCommunication: (customer: Customer, type: 'email' | 'whatsapp' | 'call', success: boolean) => {
    const activity = {
      customerId: customer.id,
      customerName: customer.name,
      type,
      timestamp: new Date().toISOString(),
      success
    };
    
    console.log('Communication Activity:', activity);
    
    // You could extend this to save to your database
    // Example: saveCommunicationLog(activity);
  },

  validatePhoneNumber: (phoneNumber: string): boolean => {
    // Basic validation for phone number
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    return cleanPhone.length >= 10; // Minimum 10 digits
  },

  formatPhoneForWhatsApp: (phoneNumber: string): string => {
    // Remove all non-numeric characters except +
    let cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, assume it needs country code
    if (!cleanPhone.startsWith('+')) {
      // You can modify this logic based on your needs
      // For now, assuming US numbers if no country code
      if (cleanPhone.length === 10) {
        cleanPhone = '+1' + cleanPhone;
      }
    }
    
    return cleanPhone;
  }
};
