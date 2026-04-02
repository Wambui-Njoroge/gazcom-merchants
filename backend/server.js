const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import services
const mpesaService = require('./services/mpesaService');

// Import Cloudinary service
const cloudinaryService = require('./services/cloudinaryService');

// Import email service (optional)
let emailService;
try {
    emailService = require('./services/emailService');
} catch (error) {
    console.log('Email service not configured - email notifications disabled');
    emailService = {
        sendWelcomeEmail: async () => console.log('📧 Email disabled'),
        sendOrderConfirmationEmail: async () => console.log('📧 Email disabled'),
        sendPasswordResetEmail: async () => console.log('📧 Email disabled'),
        sendOrderStatusUpdateEmail: async () => console.log('📧 Email disabled')
    };
}

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection - FIXED FOR NEON (requires SSL in production)
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'gazcom_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// ============= SAMPLE DATA (Fallback) =============
const sampleCategories = [
    { id: 1, name: 'PETROLEUM EQUIPMENTS', description: 'Pipes, valves, fittings, pumps', icon: 'fas fa-oil-can', display_order: 1 },
    { id: 2, name: 'PETROLEUM ELECTRICALS', description: 'Electrical components', icon: 'fas fa-bolt', display_order: 2 },
    { id: 3, name: 'PETROL STATION PARTS', description: 'Dispensers, nozzles, hoses', icon: 'fas fa-gas-pump', display_order: 3 },
    { id: 4, name: 'PETROLEUM GAS', description: 'LPG cylinders, regulators', icon: 'fas fa-fire', display_order: 4 },
    { id: 5, name: 'PPE EQUIPMENT', description: 'Safety gear, coveralls', icon: 'fas fa-hard-hat', display_order: 5 }
];

const sampleProducts = [
    { id: 1, name: 'Steel Petroleum Pipe - 6 inch', description: 'High-grade carbon steel pipe', category_id: 1, category_name: 'PETROLEUM EQUIPMENTS', stock_quantity: 100, is_featured: true },
    { id: 2, name: 'API 6D Gate Valve', description: 'Industrial gate valve', category_id: 1, category_name: 'PETROLEUM EQUIPMENTS', stock_quantity: 50, is_featured: true },
    { id: 3, name: 'Centrifugal Pump - 5HP', description: 'Heavy-duty centrifugal pump', category_id: 1, category_name: 'PETROLEUM EQUIPMENTS', stock_quantity: 25, is_featured: true },
    { id: 4, name: 'Explosion-Proof LED Light', description: 'LED lighting for hazardous areas', category_id: 2, category_name: 'PETROLEUM ELECTRICALS', stock_quantity: 75, is_featured: true },
    { id: 5, name: 'Fuel Management System', description: 'Complete fuel management system', category_id: 2, category_name: 'PETROLEUM ELECTRICALS', stock_quantity: 10, is_featured: true },
    { id: 6, name: 'Automatic Fuel Nozzle', description: 'Automatic shut-off fuel nozzle', category_id: 3, category_name: 'PETROL STATION PARTS', stock_quantity: 150, is_featured: true },
    { id: 7, name: 'LPG Cylinder - 13kg', description: 'Standard 13kg LPG cylinder', category_id: 4, category_name: 'PETROLEUM GAS', stock_quantity: 500, is_featured: true },
    { id: 8, name: 'Flame Resistant Coverall', description: 'FR coverall for petroleum workers', category_id: 5, category_name: 'PPE EQUIPMENT', stock_quantity: 200, is_featured: true }
];

// ============= JWT Authentication Middleware =============
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'gazcom_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware - check if user has admin role
const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gazcom_secret_key');
        const user = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
        
        if (user.rows.length === 0 || user.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ============= PUBLIC API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'GAZCOM API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY display_order');
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json(sampleCategories);
        }
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.json(sampleCategories);
    }
});

// Get featured products (no price)
app.get('/api/products/featured', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.id, p.name, p.description, p.category_id, p.image_url, p.stock_quantity, p.is_featured, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true ORDER BY p.created_at DESC LIMIT 8'
        );
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            const featured = sampleProducts.filter(p => p.is_featured);
            res.json(featured);
        }
    } catch (error) {
        console.error('Error fetching featured products:', error.message);
        const featured = sampleProducts.filter(p => p.is_featured);
        res.json(featured);
    }
});

// Get all products (search) - no price
app.get('/api/products/search', async (req, res) => {
    const { q, category } = req.query;
    
    try {
        let query = `
            SELECT p.id, p.name, p.description, p.category_id, p.image_url, p.stock_quantity, p.is_featured, c.name as category_name
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE 1=1
        `;
        let params = [];
        let paramIndex = 1;
        
        if (q) {
            query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            params.push(`%${q}%`);
            paramIndex++;
        }
        
        if (category) {
            query += ` AND p.category_id = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        query += ' ORDER BY p.created_at DESC LIMIT 100';
        
        const result = await pool.query(query, params);
        
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            let products = [...sampleProducts];
            if (category) {
                products = products.filter(p => p.category_id == category);
            }
            if (q) {
                products = products.filter(p => 
                    p.name.toLowerCase().includes(q.toLowerCase()) || 
                    (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
                );
            }
            res.json(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.json(sampleProducts);
    }
});

// Get products by category - no price
app.get('/api/products/category/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT id, name, description, category_id, image_url, stock_quantity FROM products WHERE category_id = $1 ORDER BY created_at DESC',
            [categoryId]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            const products = sampleProducts.filter(p => p.category_id == categoryId);
            res.json(products);
        }
    } catch (error) {
        console.error('Error fetching products by category:', error.message);
        const products = sampleProducts.filter(p => p.category_id == categoryId);
        res.json(products);
    }
});

// Get single product - no price
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT p.id, p.name, p.description, p.category_id, p.image_url, p.stock_quantity, p.specifications, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
            [id]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            const product = sampleProducts.find(p => p.id == id);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
    } catch (error) {
        console.error('Error fetching product:', error.message);
        const product = sampleProducts.find(p => p.id == id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }
});

// Get product count by category
app.get('/api/products/category/:categoryId/count', async (req, res) => {
    const { categoryId } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT COUNT(*) FROM products WHERE category_id = $1',
            [categoryId]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        const count = sampleProducts.filter(p => p.category_id == categoryId).length;
        res.json({ count });
    }
});

// ============= AUTH ROUTES =============

// Register - ALWAYS creates a regular user (role = 'user')
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;
    
    try {
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, phone, role) 
             VALUES ($1, $2, $3, $4, $5, 'user') 
             RETURNING id, username, email, full_name, phone, role`,
            [username, email, hashedPassword, full_name, phone]
        );
        
        const token = jwt.sign(
            { userId: result.rows[0].id, username: result.rows[0].username, role: 'user' },
            process.env.JWT_SECRET || 'gazcom_secret_key',
            { expiresIn: '7d' }
        );
        
        emailService.sendWelcomeEmail(result.rows[0]).catch(console.error);
        
        res.json({ 
            token, 
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                full_name: result.rows[0].full_name,
                phone: result.rows[0].phone,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'gazcom_secret_key',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, full_name, phone, role FROM users WHERE id = $1',
            [req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ valid: false });
        }
        
        res.json({ valid: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ valid: false });
    }
});

// Update user profile
app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
    const { full_name, email, phone } = req.body;
    const userId = req.user.userId;
    
    try {
        const emailCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, userId]
        );
        
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        const result = await pool.query(
            `UPDATE users 
             SET full_name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, username, email, full_name, phone, role`,
            [full_name, email, phone, userId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// ============= PASSWORD RESET ROUTES =============

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000);
        
        await pool.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.rows[0].id, resetToken, expiresAt]
        );
        
        await emailService.sendPasswordResetEmail(user.rows[0], resetToken);
        
        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    try {
        const resetRecord = await pool.query(
            'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        
        if (resetRecord.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, resetRecord.rows[0].user_id]);
        await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
        
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ============= ORDER ROUTES =============

// Get all user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
             FROM orders o 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single order details
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.userId]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [id]
        );
        
        res.json({
            order: orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ============= M-PESA ROUTES =============

app.post('/api/mpesa/stkpush', authenticateToken, async (req, res) => {
    const { phoneNumber, amount, orderId } = req.body;
    
    let formattedPhone = phoneNumber.toString().replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }
    
    const accountReference = `GAZCOM-${orderId}`;
    const transactionDesc = 'Payment for order';
    
    try {
        const result = await mpesaService.initiateSTKPush(
            formattedPhone,
            amount,
            accountReference,
            transactionDesc
        );
        
        res.json(result);
    } catch (error) {
        console.error('M-Pesa STK Push error:', error);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
});

app.post('/api/mpesa/callback', async (req, res) => {
    const callbackData = req.body;
    console.log('M-Pesa Callback received');
    
    if (callbackData.Body?.stkCallback?.ResultCode === 0) {
        const mpesaReceiptNumber = callbackData.Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
        const amount = callbackData.Body.stkCallback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value;
        
        console.log(`✅ Payment successful: ${mpesaReceiptNumber} - Amount: ${amount}`);
    } else {
        console.log('❌ Payment failed:', callbackData.Body?.stkCallback?.ResultDesc);
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============= CLOUDINARY IMAGE ROUTES =============

// Upload image file (admin only)
app.post('/api/upload/image', verifyAdmin, cloudinaryService.upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const result = await cloudinaryService.uploadImage(req.file.buffer, {
            folder: 'gazcom_products',
            public_id: req.body.public_id || undefined
        });
        
        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload image from URL (admin only)
app.post('/api/upload/from-url', verifyAdmin, async (req, res) => {
    try {
        const { imageUrl, public_id } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }
        
        const result = await cloudinaryService.uploadImageFromUrl(imageUrl, {
            folder: 'gazcom_products',
            public_id: public_id
        });
        
        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get optimized image URL
app.get('/api/images/optimized/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;
        const { width, height, crop } = req.query;
        
        const url = cloudinaryService.getOptimizedImageUrl(publicId, {
            width: width ? parseInt(width) : 800,
            height: height ? parseInt(height) : 800,
            crop: crop || 'limit'
        });
        
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete image (admin only)
app.delete('/api/images/:publicId', verifyAdmin, async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinaryService.deleteImage(publicId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List images (admin only)
app.get('/api/images/list', verifyAdmin, async (req, res) => {
    try {
        const images = await cloudinaryService.listImages('gazcom_products', 50);
        res.json(images);
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= ADMIN ROUTES =============

// Add product (price is optional)
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
    const { name, description, category_id, sub_category, sku, image_url, stock_quantity, is_featured } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO products (name, description, category_id, sub_category, sku, image_url, stock_quantity, is_featured) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, description, category_id, sub_category, sku, image_url, stock_quantity || 0, is_featured || false]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Database error: ' + error.message });
    }
});

app.get('/api/admin/products', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/admin/products/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/admin/categories', verifyAdmin, async (req, res) => {
    const { name, description, icon, display_order } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO categories (name, description, icon, display_order) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, description, icon || 'fas fa-box', display_order || 0]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/admin/orders/:id/status', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        const currentOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        
        if (currentOrder.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [currentOrder.rows[0].user_id]);
        
        if (emailService && emailService.sendOrderStatusUpdateEmail && user.rows.length > 0) {
            emailService.sendOrderStatusUpdateEmail(result.rows[0], user.rows[0], currentOrder.rows[0].status, status).catch(console.error);
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT o.*, u.username, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const products = await pool.query('SELECT COUNT(*) FROM products');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        const orders = await pool.query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
        const users = await pool.query('SELECT COUNT(*) FROM users');
        
        res.json({
            totalProducts: parseInt(products.rows[0].count),
            totalCategories: parseInt(categories.rows[0].count),
            pendingOrders: parseInt(orders.rows[0].count),
            totalUsers: parseInt(users.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ============= FRONTEND ROUTE (Express 5 Compatible) =============
// This must be the LAST route - it catches all non-API requests
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log(' GAZCOM GENERAL MERCHANTS API');
    console.log('=================================');
    console.log(` Server: http://localhost:${PORT}`);
    console.log(` Frontend: http://localhost:${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(` Products: http://localhost:${PORT}/api/products/search`);
    console.log(` Cloudinary Upload: http://localhost:${PORT}/api/upload/image`);
    console.log('=================================');
    console.log(' Role-based access control enabled');
    console.log('   - New users: role = "user"');
    console.log('   - Admin users: role = "admin"');
    console.log('=================================');
    console.log(' Inquiry System Active - Customers contact via email/phone');
    console.log('=================================\n');
});
