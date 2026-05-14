// Inquire functionality
function inquireProduct(product) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';
    const userName = user.full_name || user.username || 'Customer';
    const userPhone = user.phone || 'Not provided';

    const subject = `Product Inquiry: ${product.name} (ID: ${product.id})`;
    const body = `Dear GAZCOM Team,\n\nI am interested in the following product from your catalog:\n\nProduct Details:\nProduct Name: ${product.name}\nCategory: ${product.category_name || 'Petroleum Equipment'}\nProduct ID: ${product.id}\n\nMy Contact Information:\nName: ${userName}\nEmail: ${userEmail}\nPhone: ${userPhone}\n\nRequest:\nPlease send me more information about this product.\n\nAdditional Questions:\n${userName === 'Customer' ? 'Please contact me with more details about this product.' : 'I look forward to your response with the requested information.'}\n\nThank you for your assistance.\n\nBest regards,\n${userName}\n${userPhone !== 'Not provided' ? `Tel: ${userPhone}` : ''}\n${userEmail ? `Email: ${userEmail}` : ''}\n\n--\nThis inquiry was sent from GAZCOM website.\nwww.gazcom.com | +254 724 515 819`;

    window.location.href = `mailto:gazcom.gm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

// Add core CSS animations if not already present
if (!document.querySelector('#gazcom-dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'gazcom-dynamic-styles';
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
}

// ---------- Category Carousel ----------
let currentCategoryIndex = 0;
let categories = [];
let carouselInterval;

async function loadCategoryCarousel() {
    const slidesContainer = document.getElementById('categoryCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    if (!slidesContainer) return;

    try {
        const response = await fetch('/api/categories');
        categories = await response.json();
        if (!categories.length) return;

        renderCarousel();
        startAutoRotate();
        attachCarouselEvents();
    } catch (error) {
        console.error('Error loading category carousel:', error);
    }
}

// ✅ UPDATED: Use Cloudinary URLs for category background images
// After uploading your images, replace the version numbers (v123456) with your actual ones.
function getCategoryBackgroundImage(category) {
    const imageMap = {
        1: 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/petroleum-equipment.jpg',
        2: 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/electricals.jpg',
        3: 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/petrol-station.jpg',
        4: 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/gas.jpg',
        5: 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/ppe.jpg'
    };
    return imageMap[category.id] || 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/default.jpg';
}

function renderCarousel() {
    const slidesContainer = document.getElementById('categoryCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    if (!slidesContainer) return;

    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    categories.forEach((cat, index) => {
        const bgImage = getCategoryBackgroundImage(cat);
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === currentCategoryIndex ? 'active' : ''}`;
        slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${bgImage}')`;
        slide.style.backgroundSize = 'cover';
        slide.style.backgroundPosition = 'center';
        slide.dataset.index = index;
        slide.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                window.location.href = `shop.html?category=${cat.id}`;
            }
        };

        slide.innerHTML = `
            <div class="carousel-content">
                <i class="${cat.icon || 'fas fa-box'}"></i>
                <h3>${escapeHtml(cat.name)}</h3>
                <p>${escapeHtml(cat.description || 'Shop our premium range of petroleum equipment and accessories.')}</p>
                <button class="cta-button" onclick="event.stopPropagation(); window.location.href='shop.html?category=${cat.id}'">
                    Explore Now <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        slidesContainer.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = `dot ${index === currentCategoryIndex ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.onclick = (e) => {
            e.stopPropagation();
            goToSlide(index);
        };
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    if (index < 0) index = categories.length - 1;
    if (index >= categories.length) index = 0;
    currentCategoryIndex = index;

    document.querySelectorAll('.carousel-slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === currentCategoryIndex);
    });
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentCategoryIndex);
    });
}

function nextSlide() {
    goToSlide(currentCategoryIndex + 1);
    resetAutoRotate();
}

function prevSlide() {
    goToSlide(currentCategoryIndex - 1);
    resetAutoRotate();
}

function startAutoRotate() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 6000);
}

function resetAutoRotate() {
    if (carouselInterval) clearInterval(carouselInterval);
    startAutoRotate();
}

function attachCarouselEvents() {
    const prevBtn = document.getElementById('prevCategoryBtn');
    const nextBtn = document.getElementById('nextCategoryBtn');
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); };
    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); };

    const container = document.querySelector('.carousel-container');
    if (container) {
        container.addEventListener('mouseenter', () => {
            if (carouselInterval) clearInterval(carouselInterval);
        });
        container.addEventListener('mouseleave', startAutoRotate);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---------- Featured Products ----------
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
                <img src="${product.image_url || 'https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/default.jpg'}" alt="${escapeHtml(product.name)}" class="product-image" onerror="this.src='https://res.cloudinary.com/de65rjfno/image/upload/v1234567890/default.jpg'">
                <div class="product-info">
                    <div class="product-title">${escapeHtml(product.name)}</div>
                    <div class="product-category">${escapeHtml(product.category_name || 'Petroleum Equipment')}</div>
                    <div class="product-description">${escapeHtml(product.description ? product.description.substring(0, 100) : 'Quality petroleum equipment')}...</div>
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

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadCategoryCarousel();
    loadFeaturedProducts();
});

// Global exports
window.inquireProduct = inquireProduct;
window.viewProduct = viewProduct;
window.makePhoneCall = makePhoneCall;
window.whatsappContact = whatsappContact;