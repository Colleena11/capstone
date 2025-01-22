document.addEventListener('DOMContentLoaded', async () => {
    try {
        await checkBuyerAuth();
        loadCartItems();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = './login.html';
    }
});

async function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    
    try {
        const user = firebase.auth().currentUser;
        const cartSnapshot = await firebase.firestore()
            .collection('cart')
            .where('userId', '==', user.uid)
            .get();

        if (cartSnapshot.empty) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            return;
        }

        let total = 0;
        const cartItemsHTML = [];

        for (const cartDoc of cartSnapshot.docs) {
            const cartItem = cartDoc.data();
            const artworkDoc = await firebase.firestore()
                .collection('approved_artworks')
                .doc(cartItem.artworkId)
                .get();

            if (artworkDoc.exists) {
                const artwork = artworkDoc.data();
                total += artwork.price;
                cartItemsHTML.push(`
                    <div class="cart-item" data-id="${cartDoc.id}">
                        <img src="${artwork.imageUrl || '../images/sample.png'}" 
                             alt="${artwork.title}"
                             onerror="this.src='../images/sample.png'">
                        <div class="item-details">
                            <h3>${artwork.title}</h3>
                            <p>By ${artwork.artist}</p>
                        </div>
                        <div class="item-price">$${artwork.price.toFixed(2)}</div>
                        <button class="remove-btn" onclick="removeFromCart('${cartDoc.id}')">
                            Remove
                        </button>
                    </div>
                `);
            }
        }

        cartItemsContainer.innerHTML = cartItemsHTML.join('');
        totalAmount.textContent = `Total: $${total.toFixed(2)}`;

        // Add checkout button event listener
        document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
    } catch (error) {
        console.error('Error loading cart:', error);
        cartItemsContainer.innerHTML = '<div class="error-message">Failed to load cart items. Please try again later.</div>';
    }
}

async function removeFromCart(cartItemId) {
    try {
        await firebase.firestore().collection('cart').doc(cartItemId).delete();
        loadCartItems(); // Reload cart items
        alert('Item removed from cart');
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item from cart');
    }
}

function handleCheckout() {
    // Implement checkout functionality here
    alert('Checkout functionality will be implemented soon!');
}
