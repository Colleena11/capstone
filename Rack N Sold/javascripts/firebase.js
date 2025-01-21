import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getStorage,
    ref, 
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.appspot.com",
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Get Firebase service references
const dbRef = db;
const storageRef = storage;

// Make Firebase services available globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

// Add auth state listener
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', {
        userExists: !!user,
        userId: user?.uid,
        userEmail: user?.email
    });
    window.currentUser = user;
});

// Export Firebase services for module usage
export { db, auth, app };

// Initialize auth if available
const ensureAuthenticated = async () => {
    if (auth && !auth.currentUser) {
        try {
            await auth.signInAnonymously();
        } catch (error) {
            console.error('Anonymous auth failed:', error);
        }
    }
    return auth?.currentUser || null;
};

const firebaseServices = {
    async uploadArtwork(formData) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User must be logged in to upload artwork');
            }

            // Get form data
            const title = formData.get('title');
            const artist = formData.get('artist');
            const price = parseFloat(formData.get('price'));
            const description = formData.get('description');

            // Create artwork document
            const artworkData = {
                title,
                artist,
                price,
                description,
                userId: user.uid,
                createdAt: serverTimestamp(),
                status: 'pending'
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, 'artworks'), artworkData);
            
            return {
                success: true,
                docId: docRef.id,
                message: 'Artwork information saved successfully'
            };
        } catch (error) {
            console.error('Error in uploadArtwork:', error);
            throw new Error(error.message || 'Failed to save artwork information');
        }
    },

    getArtworks: async function() {
        try {
            const snapshot = await dbRef.collection('artworks')
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
            const artworkDoc = await dbRef.collection('artworks').doc(artworkId).get();
            if (!artworkDoc.exists) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            
            // Add to cart collection
            await dbRef.collection('cart').add({
                artworkId: artworkId,
                title: artworkData.title,
                artist: artworkData.artist,
                price: artworkData.price,
                imageUrl: artworkData.imageUrl,
                addedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    },

    getCartItems: async function() {
        try {
            const snapshot = await dbRef.collection('cart')
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
            await dbRef.collection('cart').doc(cartItemId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw new Error('Failed to remove item from cart');
        }
    },

    deleteArtwork: async function(artworkId) {
        try {
            // Get artwork data first to get the image URL
            const artworkDoc = await dbRef.collection('artworks').doc(artworkId).get();
            const artworkData = artworkDoc.data();

            // Delete the image from Storage if it exists
            if (artworkData && artworkData.imageUrl && artworkData.imageUrl.startsWith('https://')) {
                const imageRef = ref(storageRef, artworkData.imageUrl);
                await deleteObject(imageRef);
            }

            // Delete the document from Firestore
            await dbRef.collection('artworks').doc(artworkId).delete();

            return { success: true, message: 'Artwork deleted successfully' };
        } catch (error) {
            console.error('Error in deleteArtwork:', error);
            throw new Error('Failed to delete artwork: ' + error.message);
        }
    },

    getPendingArtworks: async function() {
        try {
            console.log('Fetching pending artworks...');
            const snapshot = await dbRef.collection('pending_artworks')
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
            const artworkRef = dbRef.collection('pending_artworks').doc(artworkId);
            const artworkDoc = await artworkRef.get();
            
            if (!artworkDoc.exists) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            
            if (status === 'approved') {
                // Move to approved artworks collection
                await dbRef.collection('artworks').add({
                    ...artworkData,
                    status: 'approved',
                    verificationStatus: 'approved',
                    verifiedAt: serverTimestamp()
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

// Make services available globally
window.firebaseServices = firebaseServices;

export default firebaseServices;

console.log('Firebase initialized with services:', !!window.firebaseServices);

// Function to handle artwork submission
async function submitArtwork(artworkData) {
    try {
        // Add to pending_artworks collection
        await dbRef.collection('pending_artworks').add({
            ...artworkData,
            status: 'pending',
            submittedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error submitting artwork:', error);
        return false;
    }
}

// Function to handle admin approval
async function verifyArtwork(artworkId, status) {
    const artworkRef = dbRef.collection('pending_artworks').doc(artworkId);
    const artwork = await artworkRef.get();
    
    if (status === 'approved') {
        // Move to approved_artworks collection
        await dbRef.collection('approved_artworks').add({
            ...artwork.data(),
            approvedAt: serverTimestamp()
        });
    }
    
    // Remove from pending
    await artworkRef.delete();
}

console.log('Firebase services ready');