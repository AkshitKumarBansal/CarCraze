const nodemailer = require('nodemailer');

const fs = require('fs');
const path = require('path');

// Create a reusable transporter object
let transporter;
let initializationPromise = null;

const initializeTransporter = async () => {
  if (process.env.SMTP_HOST) {
    // Use real SMTP if configured
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate or reuse a test ethereal account if no SMTP config is provided
    try {
      const accountPath = path.join(__dirname, 'ethereal-account.json');
      let testAccount;
      
      if (fs.existsSync(accountPath)) {
        testAccount = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
      } else {
        testAccount = await nodemailer.createTestAccount();
        fs.writeFileSync(accountPath, JSON.stringify(testAccount));
      }

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('----------------------------------------------------');
      console.log('📧 Ethereal Email Test Account ready for development');
      console.log(`   Login URL: https://ethereal.email/login`);
      console.log(`   User: ${testAccount.user}`);
      console.log(`   Pass: ${testAccount.pass}`);
      console.log('   (You can log in here to see all sent emails!)');
      console.log('----------------------------------------------------');
    } catch (err) {
      console.error('Failed to create/load Ethereal test account:', err);
    }
  }
};

// Initialize the transporter when the module loads
initializationPromise = initializeTransporter();

/**
 * Helper to send email
 */
const sendEmail = async (to, subject, html) => {
  if (initializationPromise) {
    await initializationPromise;
  }

  if (!transporter) {
    console.warn('Transporter failed to initialize. Skipping email:', subject);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"CarCraze" <noreply@carcraze.com>',
      to,
      subject,
      html,
    });

    console.log(`✉️  Email sent: ${subject}`);
    // If using Ethereal, log the preview URL
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`👁️  Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

/**
 * Send Welcome Email on Signup
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to CarCraze! 🚗';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #6366f1;">Welcome to CarCraze, ${user.firstName}!</h2>
      <p>We are thrilled to have you on board. Whether you are looking to buy, sell, or rent, you've come to the right place.</p>
      <p>Log in to your dashboard to start exploring the best cars.</p>
      <br />
      <p>Best regards,<br/><strong>The CarCraze Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

/**
 * Send Order Confirmation
 */
const sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmation #${order._id} - CarCraze`;
  
  let itemsHtml = order.items.map(item => {
    let rentalText = '';
    if (item.startDate && item.endDate) {
      rentalText = `<br/><small>Rental Period: ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}</small>`;
    }
    return `
      <li style="margin-bottom: 10px;">
        <strong>${item.car.brand} ${item.car.model} (${item.car.year})</strong> - ₹${item.price.toLocaleString('en-IN')}
        ${rentalText}
      </li>
    `;
  }).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #10b981;">Order Confirmed!</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for your order! Your order has been placed successfully.</p>
      
      <div style="background: #f8f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${order.total.toLocaleString('en-IN')}</p>
        <ul>
          ${itemsHtml}
        </ul>
      </div>
      
      <p>You can track your order status in your dashboard.</p>
      <br />
      <p>Best regards,<br/><strong>The CarCraze Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

/**
 * Send Rental Reminder
 */
const sendRentalReminder = async (user, rental, car) => {
  const subject = `Rental Booking Reminder - CarCraze`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #6366f1;">Your Rental is Confirmed!</h2>
      <p>Hi ${user.firstName},</p>
      <p>This is a reminder for your upcoming rental booking.</p>
      <div style="background: #f8f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>Rental Details</h3>
        <p><strong>Car:</strong> ${car.brand} ${car.model} (${car.year})</p>
        <p><strong>Pickup Date:</strong> ${new Date(rental.startDate).toLocaleDateString()}</p>
        <p><strong>Return Date:</strong> ${new Date(rental.endDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹${rental.totalAmount.toLocaleString('en-IN')}</p>
      </div>
      <p>Please make sure to have your ID and booking confirmation ready at pickup.</p>
      <br />
      <p>Best regards,<br/><strong>The CarCraze Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const subject = 'CarCraze Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto;">
      <h2 style="color: #6366f1;">🔐 Password Reset</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset for your CarCraze account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 0.9rem;">This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
      <p>Best regards,<br/><strong>The CarCraze Team</strong></p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendRentalReminder,
  sendPasswordResetEmail
};
