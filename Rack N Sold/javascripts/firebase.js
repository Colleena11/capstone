// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.firebasestorage.app",
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772",
    measurementId: "G-VCCD9M4JZV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Firebase Services
window.firebaseServices = {
    uploadArtwork: async function(data) {
        try {
            // Ensure we have an image URL
            const artworkData = {
                ...data,
                imageUrl: data.imageUrl || 'images/sample.png',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('artworks').add(artworkData);
            console.log('Upload successful, ID:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error('Failed to save artwork');
        }
    },

    getArtworks: async function() {
        try {
            const snapshot = await db.collection('artworks')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    },

    addToCart: async function(artworkId) {
        try {
            // Get artwork details
            const artworkDoc = await db.collection('artworks').doc(artworkId).get();
            if (!artworkDoc.exists) {
                throw new Error('Artwork not found');
            }

            const artwork = {
                id: artworkDoc.id,
                ...artworkDoc.data()
            };

            // Add to cart collection
            await db.collection('cart').add({
                artworkId: artworkId,
                title: artwork.title,
                artist: artwork.artist,
                price: artwork.price,
                imageUrl: artwork.imageUrl,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Add to cart failed:', error);
            throw new Error('Failed to add to cart');
        }
    },

    getCartItems: async function() {
        try {
            const snapshot = await db.collection('cart')
                .orderBy('addedAt', 'desc')
                .get();
            
            return snapshot.docs.map(doc => ({
                cartId: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting cart items:', error);
            return [];
        }
    },

    removeFromCart: async function(cartItemId) {
        try {
            await db.collection('cart').doc(cartItemId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw new Error('Failed to remove item from cart');
        }
    }
};

console.log('Firebase services ready');