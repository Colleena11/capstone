document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cart-items');

    async function loadCartItems() {
        try {
            cartContainer.innerHTML = '<p>Loading cart items...</p>';
            const items = await window.firebaseServices.getCartItems();
            
            if (!items || items.length === 0) {
                cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
                updateTotals(0);
                return;
            }

            cartContainer.innerHTML = items.map(item => `
                <div class="cart-item" data-id="${item.cartId}">
                    <img src="${item.imageUrl || 'images/sample.png'}" alt="${item.title}">
                    <div class="item-details">
                        <h3>${item.title}</h3>
                        <p>Artist: ${item.artist}</p>
                        <p class="price">$${Number(item.price).toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart('${item.cartId}')" class="remove-btn">Remove</button>
                </div>
            `).join('');

            updateTotals(items);
        } catch (error) {
            console.error('Failed to load cart:', error);
            cartContainer.innerHTML = '<p class="error">Error loading cart items</p>';
        }
    }

    function updateTotals(items) {
        const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
        const shipping = subtotal > 0 ? 10 : 0;
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    // Global function for removing items
    window.removeFromCart = async (cartItemId) => {
        try {
            await window.firebaseServices.removeFromCart(cartItemId);
            await loadCartItems();
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Could not remove item from cart');
        }
    };

    // Initial cart load
    await loadCartItems();
});
