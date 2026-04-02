// Check if user is admin
async function checkAdminAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!data.valid || data.user.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    } catch (error) {
        window.location.href = 'login.html';
        return false;
    }
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const stats = await response.json();
        
        document.getElementById('total-products').textContent = stats.totalProducts || 0;
        document.getElementById('total-categories').textContent = stats.totalCategories || 0;
        document.getElementById('total-orders').textContent = stats.pendingOrders || 0;
        document.getElementById('total-users').textContent = stats.totalUsers || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const products = await response.json();
        
        const tbody = document.getElementById('products-table-body');
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;"></td>
                <td><strong>${product.name}</strong></td>
                <td>${product.category_name || 'Uncategorized'}</td>
                <td>KES ${Number(product.price).toLocaleString()}</td>
                <td>${product.stock_quantity}</td>
                <td class="action-buttons">
                    <button class="btn-warning btn-icon" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-icon" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        // Update category filter
        const filter = document.getElementById('category-filter-admin');
        if (filter) {
            filter.innerHTML = '<option value="">All Categories</option>' + 
                categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
        
        // Update product form category select
        const categorySelect = document.getElementById('product-category');
        if (categorySelect) {
            categorySelect.innerHTML = categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
        
        // Update categories table
        const tbody = document.getElementById('categories-table-body');
        if (tbody) {
            tbody.innerHTML = categories.map(cat => `
                <tr>
                    <td>${cat.id}</td>
                    <td><i class="${cat.icon || 'fas fa-box'}"></i></td>
                    <td><strong>${cat.name}</strong></td>
                    <td>${cat.description || '-'}</td>
                    <td><span class="badge">0 products</span></td>
                    <td class="action-buttons">
                        <button class="btn-warning btn-icon" onclick="editCategory(${cat.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger btn-icon" onclick="deleteCategory(${cat.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Save product
async function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name')?.value;
    const categoryId = document.getElementById('product-category')?.value;
    const price = document.getElementById('product-price')?.value;
    const stock = document.getElementById('product-stock')?.value;
    const description = document.getElementById('product-description')?.value;
    const imageUrl = document.getElementById('product-image')?.value;
    
    if (!name || !categoryId || !price) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const productData = {
        name: name,
        category_id: parseInt(categoryId),
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 0,
        description: description || '',
        image_url: imageUrl || null,
        is_featured: false
    };
    
    const token = localStorage.getItem('token');
    const submitBtn = event.submitter;
    const originalText = submitBtn?.innerHTML || 'Add Product';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Product added successfully!', 'success');
            document.getElementById('product-form').reset();
            loadProducts();
            loadDashboardStats();
        } else {
            showNotification(data.error || 'Error adding product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadProducts();
            loadDashboardStats();
            showNotification('Product deleted successfully!', 'success');
        } else {
            showNotification('Error deleting product', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting product', 'error');
    }
}

// Edit product
async function editProduct(id) {
    try {
        const response = await fetch(`/api/admin/products/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const product = await response.json();
        
        alert('Edit functionality coming soon. Product ID: ' + id);
        console.log('Product to edit:', product);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading product', 'error');
    }
}

// Edit category
async function editCategory(id) {
    alert('Edit category feature coming soon. Category ID: ' + id);
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const response = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadCategories();
            loadDashboardStats();
            showNotification('Category deleted successfully!', 'success');
        } else {
            showNotification('Error deleting category', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting category', 'error');
    }
}

// Save category
async function saveCategory(event) {
    event.preventDefault();
    
    const name = document.getElementById('category-name')?.value;
    if (!name) {
        showNotification('Category name is required', 'error');
        return;
    }
    
    const categoryData = {
        name: name,
        description: document.getElementById('category-description')?.value || '',
        icon: document.getElementById('category-icon')?.value || 'fas fa-box',
        display_order: parseInt(document.getElementById('category-order')?.value) || 0
    };
    
    try {
        const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            showNotification('Category added successfully!', 'success');
            document.getElementById('category-form').reset();
            loadCategories();
            loadDashboardStats();
            closeModal('categoryModal');
        } else {
            showNotification('Error adding category', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error', 'error');
    }
}

// Search products
function searchProducts() {
    loadProducts();
}

// Show section
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}-section`).classList.add('active');
    
    if (section === 'products') loadProducts();
    if (section === 'categories') loadCategories();
    if (section === 'orders') loadOrders();
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const orders = await response.json();
        
        const tbody = document.getElementById('orders-table-body');
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.order_number || order.id}</td>
                <td>${order.username || 'Guest'}</td>
                <td>KES ${Number(order.total_amount).toLocaleString()}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-warning btn-icon" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// View order
function viewOrder(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showProductModal() {
    document.getElementById('product-form').reset();
    showModal('productModal');
}

function showCategoryModal() {
    document.getElementById('category-form').reset();
    showModal('categoryModal');
}

// Logout
function logout() {
    localStorage.removeItem('cart');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;
    notification.onclick = () => notification.remove();
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return;
    
    loadDashboardStats();
    loadCategories();
    loadProducts();
    
    // Setup form submit handlers
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', saveCategory);
    }
});

// Make functions global
window.showSection = showSection;
window.saveProduct = saveProduct;
window.saveCategory = saveCategory;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.searchProducts = searchProducts;
window.showProductModal = showProductModal;
window.showCategoryModal = showCategoryModal;
window.closeModal = closeModal;
window.logout = logout;
window.viewOrder = viewOrder;