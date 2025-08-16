import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import env from "dotenv";

env.config();

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Generate QR Code as base64 data URL
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Send QR Code email (simplified)
const sendQRCodeEmail = async (email, qrData) => {
  const transporter = createTransporter();
  
  try {
    // Generate QR code
    const qrCodeDataURL = await generateQRCode(qrData);
    
    // Extract base64 data from data URL
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    
    const mailOptions = {
      from: {
        name: 'CredifyU',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Your CredifyU Digital Credential QR Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Digital Credential</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 20px;
            }
            .logo-icon {
              width: 40px;
              height: 40px;
              background: #000;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 600;
              color: #000;
            }
            h1 {
              color: #1f2937;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .subtitle {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .qr-container {
              text-align: center;
              background: #f8f9fa;
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
              border: 2px dashed #e5e7eb;
            }
            .qr-code {
              max-width: 256px;
              width: 100%;
              height: auto;
              border-radius: 8px;
              background: white;
              padding: 10px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .instructions {
              background: #eff6ff;
              border: 1px solid #dbeafe;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .instructions h3 {
              color: #1e40af;
              margin: 0 0 15px 0;
              font-size: 18px;
            }
            .instructions ul {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 8px;
              color: #1e40af;
            }
            .security-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .security-note strong {
              color: #92400e;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">🔐</div>
                <div class="logo-text">CredifyU</div>
              </div>
              <h1>Your Digital Credential</h1>
              <p class="subtitle">Secure, verifiable, and instantly accessible</p>
            </div>

            <div class="qr-container">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Your QR Code</h3>
              <img src="cid:qrcode" alt="Your Digital Credential QR Code" class="qr-code" />
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                Scan this QR code to verify your digital credential
              </p>
            </div>

            <div class="instructions">
              <h3>How to Use Your QR Code</h3>
              <ul>
                <li>Save this QR code image to your device</li>
                <li>Present it when credential verification is required</li>
                <li>The QR code contains your digitally signed credential information</li>
                <li>Verifiers can scan it to instantly validate your credentials</li>
                <li>Works offline once saved to your device</li>
              </ul>
            </div>

            <div class="security-note">
              <strong>🔒 Security Notice:</strong> This QR code contains cryptographically signed data that cannot be tampered with. Keep it secure and do not share it unnecessarily.
            </div>

            <div class="footer">
              <p>
                This credential was issued by your institution through CredifyU.<br>
                For support, please contact your institution's credential office.
              </p>
              <p style="margin-top: 15px;">
                <strong>CredifyU</strong> - Secure Digital Credentials
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'credential-qr-code.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'qrcode'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('QR Code email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending QR code email:', error);
    throw new Error('Failed to send QR code email');
  }
};

// Send QR codes to multiple students
const sendBulkQRCodes = async (students) => {
  const results = [];
  const errors = [];
  
  console.log(`Starting bulk QR code sending for ${students.length} students`);
  
  // Process emails with a delay to avoid rate limiting
  for (let i = 0; i < students.length; i++) {
    const { email, qrData } = students[i];
    
    try {
      console.log(`Sending QR code ${i + 1}/${students.length} to: ${email}`);
      
      const result = await sendQRCodeEmail(email, qrData);
      results.push({
        email,
        success: true,
        messageId: result.messageId
      });
      
      // Add delay between emails to avoid rate limiting (1 second)
      if (i < students.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Failed to send QR code to ${email}:`, error.message);
      errors.push({
        email,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log(`Bulk QR code sending completed. Success: ${results.length}, Errors: ${errors.length}`);
  
  return {
    totalSent: students.length,
    successful: results.length,
    failed: errors.length,
    results: results,
    errors: errors
  };
};

// Main function to send QR code (single)
const sendQRCode = async (email, qrData) => {
  try {
    console.log(`Sending QR code to: ${email}`);
    
    const result = await sendQRCodeEmail(email, qrData);
    
    console.log(`QR code sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.error('Error in sendQRCode:', error);
    throw error;
  }
};

export { sendQRCode, sendBulkQRCodes, generateQRCode };
