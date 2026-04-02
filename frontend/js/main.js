// Inquire functionality - Replaces cart system
// Inquire functionality - Professional email template
function inquireProduct(product) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    const userName = user.full_name || user.username || 'Customer';
    const userPhone = user.phone || 'Not provided';

    // Create professional email subject
    const subject = `Product Inquiry: ${product.name} (ID: ${product.id})`;

    // Create professional email body with actual line breaks (not encoded)
    const body = `Dear GAZCOM Team,

I am interested in the following product from your catalog:

Product Details:
Product Name: ${product.name}
Category: ${product.category_name || 'Petroleum Equipment'}
Product ID: ${product.id}

My Contact Information:
------------------
Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}

Request:

Please send me more information about this product.

Additional Questions:

${userName === 'Customer' ? 'Please contact me with more details about this product.' : 'I look forward to your response with the requested information.'}

Thank you for your assistance.

Best regards,
${userName}
${userPhone !== 'Not provided' ? `Tel: ${userPhone}` : ''}
${userEmail ? `Email: ${userEmail}` : ''}

--
This inquiry was sent from GAZCOM website.
www.gazcom.com | +254 724 515 819`;

    // Encode for URL (this converts line breaks to %0D%0A automatically)
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    // Open email client
    window.location.href = `mailto:gazcom.gm@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;

    // Show confirmation message
    showNotification('Opening your email client...', 'info');
}
function makePhoneCall() {
    window.location.href = 'tel:+254724515819';
}

function whatsappContact() {
    const message = 'Hello GAZCOM, I am interested in your products. Please share more information.';
    window.location.href = `https://wa.me/254724515819?text=${encodeURIComponent(message)}`;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;
    notification.onclick = () => notification.remove();
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Load categories
async function loadCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        grid.innerHTML = categories.map(cat => `
            <div class="category-card" onclick="window.location.href='shop.html?category=${cat.id}'">
                <i class="${cat.icon || 'fas fa-box'}"></i>
                <h3>${cat.name}</h3>
                <p>${cat.description || 'View products'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
        grid.innerHTML = '<div class="loading">Unable to load categories</div>';
    }
}

// Load featured products
async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products');
    if (!grid) return;

    try {
        const response = await fetch('/api/products/featured');
        const products = await response.json();

        if (products.length === 0) {
            grid.innerHTML = '<div class="loading">No featured products available</div>';
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="viewProduct(${product.id})">
                <img src="${product.image_url || 'https://via.placeholder.com/300x250?text=Petroleum+Product'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-category">${product.category_name || 'Petroleum Equipment'}</div>
                    <div class="product-description">${product.description ? product.description.substring(0, 100) : 'Quality petroleum equipment'}...</div>
                    <button class="inquire-btn" onclick="event.stopPropagation(); inquireProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-envelope"></i> Inquire
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading featured products:', error);
        grid.innerHTML = '<div class="loading">Unable to load products</div>';
    }
}

// Check authentication status
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.valid && data.user) {
            const loginLink = document.querySelector('a[href="login.html"]');
            if (loginLink) {
                loginLink.textContent = '👤 DASHBOARD';
                loginLink.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

    if (window.location.pathname === '/' ||
        window.location.pathname === '/index.html' ||
        window.location.pathname === '') {
        loadCategories();
        loadFeaturedProducts();
    }
});

// Export functions
window.inquireProduct = inquireProduct;
window.viewProduct = viewProduct;
window.makePhoneCall = makePhoneCall;
window.whatsappContact = whatsappContact;