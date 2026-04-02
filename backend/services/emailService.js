const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Send welcome email
async function sendWelcomeEmail(user) {
    const transporter = createTransporter();
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to GAZCOM</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2C5F2D, #FF6B35); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #2C5F2D; color: white; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: bold; }
                .button:hover { background: #FF6B35; }
                .feature-list { margin: 20px 0; padding-left: 20px; }
                .feature-list li { margin: 10px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
                .highlight { color: #FF6B35; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to GAZCOM!</h1>
                    <p>Your Trusted Partner in Petroleum Equipment</p>
                </div>
                <div class="content">
                    <h2>Hello ${user.full_name || user.username}!</h2>
                    <p>Thank you for joining <span class="highlight">GAZCOM GENERAL MERCHANTS</span> - your premier source for quality petroleum equipment and supplies.</p>
                    
                    <h3>What you can do with your account:</h3>
                    <ul class="feature-list">
                        <li>✅ Browse our extensive catalog of petroleum equipment</li>
                        <li>✅ Place orders for pipes, valves, pumps, and more</li>
                        <li>✅ Track your orders in real-time</li>
                        <li>✅ Get exclusive offers and updates</li>
                        <li>✅ Access your order history anytime</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5000/shop.html" class="button">Start Shopping Now</a>
                    </div>
                    
                    <p>If you have any questions, our support team is here to help 24/7.</p>
                    <p>Welcome to the GAZCOM family!</p>
                    <p>Best regards,<br><strong>The GAZCOM Team</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 GAZCOM GENERAL MERCHANTS. All rights reserved.</p>
                    <p>Nairobi, Kenya | +254 724 515 819 | gazcom.gm@gmail.com</p>
                    <p><small>This email was sent to ${user.email}. If you didn't create an account, please ignore this email.</small></p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"GAZCOM" <gazcom.gm@gmail.com>',
        to: user.email,
        subject: 'Welcome to GAZCOM General Merchants!',
        html: htmlContent,
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending welcome email:', error.message);
        return false;
    }
}

// Send order confirmation email
async function sendOrderConfirmationEmail(order, user, items) {
    const transporter = createTransporter();
    
    const itemsHtml = items && items.length > 0 ? items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.price || 0).toLocaleString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" style="padding: 12px; text-align: center;">Order details will be updated shortly</td></tr>';
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Order Confirmation - GAZCOM</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2C5F2D, #FF6B35); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #f0f0f0; padding: 12px; text-align: left; }
                .total { font-size: 18px; font-weight: bold; color: #FF6B35; text-align: right; margin-top: 20px; }
                .button { display: inline-block; padding: 12px 30px; background: #2C5F2D; color: white; text-decoration: none; border-radius: 50px; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
                .status { display: inline-block; padding: 5px 15px; background: #FF6B35; color: white; border-radius: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Confirmation</h1>
                </div>
                <div class="content">
                    <h2>Thank you for your order, ${user.full_name || user.username}!</h2>
                    <p>Your order has been received and is being processed.</p>
                    
                    <div class="order-details">
                        <h3>Order #${order.order_number || order.id}</h3>
                        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                        <p><strong>Shipping Address:</strong> ${order.shipping_address || 'Not specified'}</p>
                        <p><strong>Order Status:</strong> <span class="status">${order.status || 'Pending'}</span></p>
                        
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            <h3>Total: KES ${(order.total_amount || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5000/dashboard.html" class="button">Track Your Order</a>
                    </div>
                    
                    <p>We'll notify you when your order ships. Thank you for choosing GAZCOM!</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 GAZCOM GENERAL MERCHANTS. All rights reserved.</p>
                    <p>Questions? Contact us at +254 724 515 819 or reply to this email</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"GAZCOM" <gazcom.gm@gmail.com>',
        to: user.email,
        subject: `Order Confirmation #${order.order_number || order.id} - GAZCOM`,
        html: htmlContent,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order confirmation sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending order confirmation:', error.message);
        return false;
    }
}

// Send password reset email
async function sendPasswordResetEmail(user, resetToken) {
    const transporter = createTransporter();
    const resetLink = `http://localhost:5000/reset-password.html?token=${resetToken}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Password Reset - GAZCOM</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2C5F2D, #FF6B35); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #2C5F2D; color: white; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: bold; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
                .alert { color: #e74c3c; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.full_name || user.username}!</h2>
                    <p>We received a request to reset your password for your GAZCOM account.</p>
                    
                    <div class="warning">
                        <strong>⚠️ Important Security Notice:</strong><br>
                        This password reset link will expire in <strong>1 hour</strong>.<br>
                        If you didn't request this, please ignore this email or contact support.
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="button">Reset Your Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${resetLink}</p>
                    
                    <p>For security reasons, never share this link with anyone.</p>
                    <p>If you have any questions, our support team is here to help.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 GAZCOM GENERAL MERCHANTS. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"GAZCOM" <gazcom.gm@gmail.com>',
        to: user.email,
        subject: 'Password Reset Request - GAZCOM',
        html: htmlContent,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending password reset email:', error.message);
        return false;
    }
}

// Send order status update email
async function sendOrderStatusUpdateEmail(order, user, oldStatus, newStatus) {
    const transporter = createTransporter();
    
    const statusMessages = {
        pending: 'Your order has been received and is pending confirmation.',
        processing: 'Your order is being processed and prepared for shipping.',
        shipped: 'Great news! Your order has been shipped and is on its way.',
        delivered: 'Your order has been delivered. Thank you for shopping with us!',
        cancelled: 'Your order has been cancelled. Contact us if this was a mistake.'
    };
    
    const statusColors = {
        pending: '#f39c12',
        processing: '#3498db',
        shipped: '#2ecc71',
        delivered: '#27ae60',
        cancelled: '#e74c3c'
    };
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Order Status Update - GAZCOM</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2C5F2D, #FF6B35); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-box { text-align: center; margin: 20px 0; }
                .status { display: inline-block; padding: 10px 25px; background: ${statusColors[newStatus] || '#FF6B35'}; color: white; border-radius: 50px; font-weight: bold; font-size: 16px; }
                .button { display: inline-block; padding: 12px 30px; background: #2C5F2D; color: white; text-decoration: none; border-radius: 50px; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Status Update</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.full_name || user.username}!</h2>
                    <p>Your order #${order.order_number || order.id} status has been updated.</p>
                    
                    <div class="status-box">
                        <div class="status">${newStatus.toUpperCase()}</div>
                    </div>
                    
                    <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5000/dashboard.html" class="button">View Order Details</a>
                    </div>
                    
                    <p>Track your order in your dashboard for real-time updates.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 GAZCOM GENERAL MERCHANTS. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"GAZCOM" <gazcom.gm@gmail.com>',
        to: user.email,
        subject: `Order Status Update #${order.order_number || order.id} - GAZCOM`,
        html: htmlContent,
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order status email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending order status email:', error.message);
        return false;
    }
}

module.exports = {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendPasswordResetEmail,
    sendOrderStatusUpdateEmail
};