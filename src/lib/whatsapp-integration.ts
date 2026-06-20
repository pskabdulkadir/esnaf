/**
 * WhatsApp Cloud API Integration
 * Sends PDF documents directly to WhatsApp contacts
 */

export interface WhatsAppSendOptions {
  phoneNumber: string;
  pdfBase64: string;
  fileName: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  invoiceDetails: string;
  companyInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

/**
 * Send PDF document via WhatsApp using Cloud API
 * Requires WhatsApp Business Account and API credentials
 */
export async function sendPDFViaWhatsAppAPI(options: WhatsAppSendOptions): Promise<boolean> {
  try {
    // WhatsApp Cloud API endpoint (requires setup)
    const WHATSAPP_BUSINESS_ACCOUNT_ID = (import.meta as any).env?.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    const WHATSAPP_API_TOKEN = (import.meta as any).env?.VITE_WHATSAPP_API_TOKEN || '';

    if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_API_TOKEN) {
      console.warn('WhatsApp API credentials not configured, using fallback method');
      return false;
    }

    // Clean phone number
    const cleanPhone = options.phoneNumber.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    
    if (cleanPhone.startsWith('0')) {
      finalPhone = '90' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('90')) {
      finalPhone = '90' + cleanPhone;
    }

    // Prepare invoice details message
    const messageText = `${options.companyInfo.name}\n\n📄 FATURAnız Hazır\n\nFatura No: ${options.invoiceNumber}\nTarih: ${options.invoiceDate}\n\n${options.invoiceDetails}\n\n💰 Toplam Tutar: ₺${options.totalAmount.toFixed(2)}\n\n📞 Tel: ${options.companyInfo.phone}\n📧 Email: ${options.companyInfo.email}`;

    // Call WhatsApp Cloud API (via Cloud Function or Backend)
    const response = await fetch('/api/whatsapp/send-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        phoneNumber: finalPhone,
        pdfBase64: options.pdfBase64,
        fileName: options.fileName,
        message: messageText
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      return false;
    }

    const result = await response.json();
    return result.success === true;

  } catch (error) {
    console.error('WhatsApp API integration error:', error);
    return false;
  }
}

/**
 * Fallback method: Prepare PDF for manual sharing via WhatsApp Web
 * Creates a downloadable PDF and opens WhatsApp Web
 */
export async function sendPDFViaWhatsAppWeb(
  pdfBlob: Blob,
  fileName: string,
  phoneNumber: string,
  messageText: string
): Promise<void> {
  try {
    // Create blob URL for download
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    // Trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after download
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    
    if (cleanPhone.startsWith('0')) {
      finalPhone = '90' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('90')) {
      finalPhone = '90' + cleanPhone;
    }

    // Open WhatsApp Web for manual file sharing
    const whatsappUrl = `https://wa.me/${finalPhone}`;
    window.open(whatsappUrl, '_blank');

  } catch (error) {
    console.error('WhatsApp Web fallback error:', error);
    throw error;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
