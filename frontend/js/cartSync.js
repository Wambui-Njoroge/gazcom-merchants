// Sync cart with server when user logs in
async function syncCartWithServer() {
    const token = localStorage.getItem('token');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (!token || cart.length === 0) return;
    
    try {
        const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart })
        });
        
        if (response.ok) {
            console.log('Cart synced with server');
        }
    } catch (error) {
        console.error('Cart sync error:', error);
    }
}

// Load cart from server
async function loadCartFromServer() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const serverCart = await response.json();
            if (serverCart.length > 0) {
                localStorage.setItem('cart', JSON.stringify(serverCart));
                updateCartCount();
            }
        }
    } catch (error) {
        console.error('Error loading cart from server:', error);
    }
}