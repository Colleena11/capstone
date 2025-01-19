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
const storage = firebase.storage(); // Make sure storage is initialized

// Firebase Services
window.firebaseServices = {
    uploadArtwork: async function(data) {
        try {
            console.log('Starting artwork upload...');
            let imageUrl = null;

            // Upload image to Firebase Storage
            if (data.imageFile) {
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`pending_artworks/${Date.now()}_${data.imageFile.name}`);
                const uploadTask = await imageRef.put(data.imageFile);
                imageUrl = await uploadTask.ref.getDownloadURL();
            }

            // Save to Firestore with pending status
            const artworkData = {
                title: data.title,
                artist: data.artist,
                price: parseFloat(data.price),
                description: data.description,
                imageUrl: imageUrl,
                status: 'pending',
                verificationStatus: 'pending',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('pending_artworks').add(artworkData);
            console.log('Artwork submitted for review:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
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

    deleteArtwork: async function(artworkId) {
        try {
            // Get artwork data first to get the image URL
            const artworkDoc = await db.collection('artworks').doc(artworkId).get();
            const artworkData = artworkDoc.data();

            // Delete the image from Storage if it exists
            if (artworkData && artworkData.imageUrl && artworkData.imageUrl.startsWith('https://')) {
                const imageRef = storage.refFromURL(artworkData.imageUrl);
                await imageRef.delete();
            }

            // Delete the document from Firestore
            await db.collection('artworks').doc(artworkId).delete();

            return { success: true, message: 'Artwork deleted successfully' };
        } catch (error) {
            console.error('Error in deleteArtwork:', error);
            throw new Error('Failed to delete artwork: ' + error.message);
        }
    },

    getPendingArtworks: async function() {
        try {
            console.log('Fetching pending artworks...');
            const snapshot = await db.collection('pending_artworks')
                .orderBy('submittedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching pending artworks:', error);
            throw error;
        }
    },

    verifyArtwork: async function(artworkId, status) {
        try {
            const artworkRef = db.collection('pending_artworks').doc(artworkId);
            const artworkDoc = await artworkRef.get();
            
            if (!artworkDoc.exists) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            
            if (status === 'approved') {
                // Move to approved artworks collection
                await db.collection('artworks').add({
                    ...artworkData,
                    status: 'approved',
                    verificationStatus: 'approved',
                    verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Delete from pending collection
            await artworkRef.delete();
            
            return { success: true };
        } catch (error) {
            console.error('Verification failed:', error);
            throw error;
        }
    }
};

console.log('Firebase services ready');