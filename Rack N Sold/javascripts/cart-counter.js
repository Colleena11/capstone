// Function to initialize cart counter
function initializeCartCounter() {
    const cartIcon = document.querySelector('.cart-icon-container');
    if (!cartIcon) {
        console.error('Cart icon container not found');
        return;
    }

    // Create cart counter element if it doesn't exist
    let cartCounter = cartIcon.querySelector('.cart-counter');
    if (!cartCounter) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartCounter.style.display = 'none';
        cartIcon.appendChild(cartCounter);
    }

    // Function to update cart count
    function updateCartCount(count) {
        if (count > 0) {
            cartCounter.textContent = count;
            cartCounter.style.display = 'flex';
        } else {
            cartCounter.style.display = 'none';
        }
    }

    // Function to start listening to cart changes
    function startCartListener(user) {
        if (!user) {
            cartCounter.style.display = 'none';
            return;
        }

        // Set up real-time listener for cart items
        return window.db.collection('cart')
            .where('userId', '==', user.uid)
            .onSnapshot((snapshot) => {
                const count = snapshot.docs.length;
                console.log('Cart items count:', count);
                updateCartCount(count);
            }, (error) => {
                console.error("Error getting cart items: ", error);
                cartCounter.style.display = 'none';
            });
    }

    // Wait for Firebase Auth to be ready
    let unsubscribe = null;
    const checkFirebase = setInterval(() => {
        if (window.auth) {
            clearInterval(checkFirebase);
            
            // Listen for auth state changes
            window.auth.onAuthStateChanged(user => {
                // Clean up previous listener if exists
                if (unsubscribe) {
                    unsubscribe();
                }
                
                // Start new listener if user is logged in
                if (user) {
                    unsubscribe = startCartListener(user);
                } else {
                    cartCounter.style.display = 'none';
                }
            });
        }
    }, 100); // Check every 100ms
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartCounter);
} else {
    initializeCartCounter();
}
