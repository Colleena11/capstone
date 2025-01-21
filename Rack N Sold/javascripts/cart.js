import { 
    collection, 
    getDocs, 
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const cartContainer = document.getElementById('cart-items');
        const checkoutBtn = document.getElementById('checkout-btn');
        const auth = window.firebaseAuth;
        const db = window.firebaseDb;

        async function loadCartItems() {
            try {
                // Check if user is logged in
                const user = auth.currentUser;
                if (!user) {
                    cartContainer.innerHTML = '<p class="error">Please log in to view your cart</p>';
                    updateTotals([]);
                    return;
                }

                cartContainer.innerHTML = '<p>Loading cart items...</p>';
                
                const cartRef = collection(db, 'cart');
                const q = query(
                    cartRef, 
                    where('userId', '==', user.uid),
                    orderBy('addedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                
                const cartItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (!cartItems || cartItems.length === 0) {
                    cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
                    updateTotals([]);
                    return;
                }

                cartContainer.innerHTML = cartItems.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.imageUrl || '../images/sample.png'}" alt="${item.title}" class="cart-item-image">
                        <div class="item-details">
                            <h3>${item.title}</h3>
                            <p>Artist: ${item.artist}</p>
                            <p class="price">₱${Number(item.price).toFixed(2)}</p>
                        </div>
                        <button onclick="removeFromCart('${item.id}')" class="remove-btn">Remove</button>
                    </div>
                `).join('');

                updateTotals(cartItems);
            } catch (error) {
                console.error('Failed to load cart:', error);
                cartContainer.innerHTML = '<p class="error">Error loading cart items</p>';
            }
        }

        function updateTotals(items) {
            const subtotal = Array.isArray(items) 
                ? items.reduce((sum, item) => sum + Number(item.price), 0)
                : 0;
            const shipping = subtotal > 0 ? 500 : 0; // 500 peso shipping fee
            const total = subtotal + shipping;

            document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
            document.getElementById('shipping').textContent = `₱${shipping.toFixed(2)}`;
            document.getElementById('total').textContent = `₱${total.toFixed(2)}`;

            checkoutBtn.disabled = subtotal === 0;
        }

        // Make removeFromCart available globally
        window.removeFromCart = async (cartItemId) => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User not authenticated');
                }

                const cartRef = doc(db, 'cart', cartItemId);
                await deleteDoc(cartRef);
                await loadCartItems();
            } catch (error) {
                console.error('Failed to remove item:', error);
                alert('Could not remove item from cart');
            }
        };

        // Handle checkout button click
        checkoutBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert('Please log in to checkout');
                return;
            }

            try {
                const cartRef = collection(db, 'cart');
                const q = query(cartRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const cartItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (!cartItems.length) {
                    throw new Error('Cart is empty');
                }

                const orderData = {
                    userId: user.uid,
                    items: cartItems,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    total: cartItems.reduce((sum, item) => sum + Number(item.price), 0)
                };

                await addDoc(collection(db, 'orders'), orderData);

                // Clear cart
                const deletePromises = cartItems.map(item => 
                    deleteDoc(doc(db, 'cart', item.id))
                );
                await Promise.all(deletePromises);

                alert('Order placed successfully!');
                await loadCartItems();
            } catch (error) {
                console.error('Checkout failed:', error);
                alert('Failed to process checkout. Please try again.');
            }
        });

        // Add auth state listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                loadCartItems();
            } else {
                cartContainer.innerHTML = '<p class="error">Please log in to view your cart</p>';
                updateTotals([]);
            }
        });

    } catch (error) {
        console.error('Cart initialization error:', error);
        document.getElementById('cart-items').innerHTML = 
            '<p class="error">Failed to initialize cart. Please try again later.</p>';
    }
});
