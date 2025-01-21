import { 
    collection, 
    query, 
    where, 
    getDocs,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let unsubscribeCart = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up auth listener');
    
    // Wait for Firebase Auth to be available
    const checkAuth = setInterval(() => {
        const auth = window.firebaseAuth;
        if (auth) {
            clearInterval(checkAuth);
            setupAuthListener(auth);
        }
    }, 100);
});

function setupAuthListener(auth) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User authenticated:', user.uid);
            setupCart(user);
        } else {
            console.log('No user signed in');
            if (unsubscribeCart) {
                unsubscribeCart();
            }
            document.getElementById('cart-items').innerHTML = '<p>Please sign in to view your cart</p>';
        }
    });
}

async function setupCart(user) {
    try {
        console.log('Setting up cart for user:', user.uid);

        // Create cart query
        const cartQuery = query(
            collection(window.firebaseDb, 'cart'),
            where('userId', '==', user.uid)
        );

        // Set up real-time listener
        unsubscribeCart = onSnapshot(cartQuery, (snapshot) => {
            console.log('Cart update received:', snapshot.size, 'items');
            const cartItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Cart items:', cartItems);
            displayCartItems(cartItems);
            updateCartTotals(cartItems);
        }, (error) => {
            console.error('Cart listener error:', error);
            document.getElementById('cart-items').innerHTML = 
                '<p class="error-message">Failed to load cart items. Please try again later.</p>';
        });

    } catch (error) {
        console.error('Setup cart error:', error);
        document.getElementById('cart-items').innerHTML = 
            '<p class="error-message">Failed to load cart. Please try again later.</p>';
    }
}

function displayCartItems(items) {
    const container = document.getElementById('cart-items');
    console.log('Displaying cart items:', items);
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    const itemsHTML = items.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-image" onerror="this.src='images/sample.png'">
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p>Artist: ${item.artist}</p>
                <p class="price">Price: ₱${Number(item.price).toFixed(2)}</p>
                <p class="added-date">Added: ${new Date(item.addedAt).toLocaleDateString()}</p>
            </div>
            <button onclick="removeFromCart('${item.id}')" class="remove-btn">Remove</button>
        </div>
    `).join('');

    container.innerHTML = itemsHTML;
}

function updateCartTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
    const shipping = items.length > 0 ? 100 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `₱${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
}

// Make removeFromCart function available globally
window.removeFromCart = async function(itemId) {
    try {
        const user = window.firebaseAuth.currentUser;
        if (!user) {
            console.log('No user found when trying to remove item');
            return;
        }

        await deleteDoc(doc(window.firebaseDb, 'cart', itemId));
        console.log('Item removed:', itemId);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        alert('Failed to remove item. Please try again.');
    }
};

// Handle checkout button
document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const user = window.firebaseAuth.currentUser;
    if (!user) {
        alert('Please sign in to checkout');
        return;
    }
    alert('Checkout functionality coming soon!');
});

// Clean up listener when leaving the page
window.addEventListener('unload', () => {
    if (unsubscribeCart) {
        unsubscribeCart();
    }
}); 