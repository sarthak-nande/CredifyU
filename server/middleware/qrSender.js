import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import env from "dotenv";
import path from 'path';
import fs from 'fs/promises';

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
    // Generate QR code with higher quality settings
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

// Send QR Code email (simplified without student info)
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
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            .info-value {
              color: #6b7280;
              text-align: right;
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
            .button {
              display: inline-block;
              background: #000;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 10px 0;
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

            ${studentInfo.name ? `
            <div class="student-info">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Credential Details</h3>
              ${studentInfo.name ? `<div class="info-row"><span class="info-label">Student Name:</span><span class="info-value">${studentInfo.name}</span></div>` : ''}
              ${studentInfo.email ? `<div class="info-row"><span class="info-label">Email:</span><span class="info-value">${studentInfo.email}</span></div>` : ''}
              ${studentInfo.branch ? `<div class="info-row"><span class="info-label">Branch:</span><span class="info-value">${studentInfo.branch}</span></div>` : ''}
              ${studentInfo.year ? `<div class="info-row"><span class="info-label">Academic Year:</span><span class="info-value">${studentInfo.year}</span></div>` : ''}
              ${studentInfo.college ? `<div class="info-row"><span class="info-label">Institution:</span><span class="info-value">${studentInfo.college}</span></div>` : ''}
            </div>
            ` : ''}

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

// Main function to send QR code
const sendQRCode = async (email, qrData, studentInfo = {}) => {
  try {
    console.log(`Sending QR code to: ${email}`);
    
    const result = await sendQRCodeEmail(email, qrData, studentInfo);
    
    console.log(`QR code sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.error('Error in sendQRCode:', error);
    throw error;
  }
};

export { sendQRCode, generateQRCode };