// Verify these match your Firebase console settings
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.appspot.com", // Make sure this is correct
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772"
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
            // Get the artwork details
            const artworkDoc = await db.collection('artworks').doc(artworkId).get();
            if (!artworkDoc.exists) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            
            // Add to cart collection
            await db.collection('cart').add({
                artworkId: artworkId,
                title: artworkData.title,
                artist: artworkData.artist,
                price: artworkData.price,
                imageUrl: artworkData.imageUrl,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
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
    },

    async removeFromGallery(artworkId) {
        try {
            await db.collection('artworks').doc(artworkId).delete();
            return true;
        } catch (error) {
            console.error('Error removing artwork:', error);
            throw error;
        }
    }
};

// Function to handle artwork submission
async function submitArtwork(artworkData) {
    try {
        // Add to pending_artworks collection
        await db.collection('pending_artworks').add({
            ...artworkData,
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error submitting artwork:', error);
        return false;
    }
}

// Function to handle admin approval
async function verifyArtwork(artworkId, status) {
    const artworkRef = db.collection('pending_artworks').doc(artworkId);
    const artwork = await artworkRef.get();
    
    if (status === 'approved') {
        // Move to approved_artworks collection
        await db.collection('approved_artworks').add({
            ...artwork.data(),
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Remove from pending
    await artworkRef.delete();
}

console.log('Firebase services ready');