import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    doc,  // Add this
    getDoc,  // Add this
    updateDoc,  // Add this
    writeBatch,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

            // Create artwork document without image
            const artworkData = {
                title: formData.get('title'),
                artist: formData.get('artist'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                userId: user.uid,
                createdAt: serverTimestamp(),
                status: 'pending'
            };

            // Save to Firestore
            const artworksRef = collection(db, 'artworks');
            const docRef = await addDoc(artworksRef, artworkData);
            
            return {
                success: true,
                docId: docRef.id,
                message: 'Artwork information saved successfully'
            };
        } catch (error) {
            console.error('Error in uploadArtwork:', error);
            throw error;
        }
    },

    getArtworks: async function() {
        try {
            const approvedArtworksRef = collection(db, 'approved_artworks');
            const artworksQuery = query(approvedArtworksRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(artworksQuery);
            
            if (snapshot.empty) {
                console.log('No approved artworks found');
                return [];
            }

            const artworks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Fetched approved artworks:', artworks);
            return artworks;
        } catch (error) {
            console.error('Error fetching approved artworks:', error);
            return [];
        }
    },

    addToCart: async function(artworkId) {
        try {
            // Get the artwork details
            const artworkDoc = await getDoc(doc(dbRef, 'artworks', artworkId));
            if (!artworkDoc.exists()) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            
            // Add to cart collection
            await addDoc(collection(dbRef, 'cart'), {
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
            const snapshot = await getDocs(query(collection(dbRef, 'cart'), orderBy('addedAt', 'desc')));
            
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
            await deleteDoc(doc(dbRef, 'cart', cartItemId));
            return { success: true };
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw new Error('Failed to remove item from cart');
        }
    },

    deleteArtwork: async function(artworkId) {
        try {
            // Get artwork data first to get the image URL
            const artworkDoc = await getDoc(doc(dbRef, 'artworks', artworkId));
            const artworkData = artworkDoc.data();

            // Delete the image from Storage if it exists
            if (artworkData && artworkData.imageUrl && artworkData.imageUrl.startsWith('https://')) {
                const imageRef = ref(storageRef, artworkData.imageUrl);
                await deleteObject(imageRef);
            }

            // Delete the document from Firestore
            await deleteDoc(doc(dbRef, 'artworks', artworkId));

            return { success: true, message: 'Artwork deleted successfully' };
        } catch (error) {
            console.error('Error in deleteArtwork:', error);
            throw new Error('Failed to delete artwork: ' + error.message);
        }
    },

    getPendingArtworks: async function() {
        try {
            console.log('Fetching pending artworks...');
            const snapshot = await getDocs(query(collection(dbRef, 'pending_artworks'), orderBy('submittedAt', 'desc')));

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
            if (!auth.currentUser) {
                throw new Error('User must be signed in');
            }

            console.log('Starting verification process for artwork:', artworkId);
            
            const artworkRef = doc(db, 'artworks', artworkId);
            const artworkDoc = await getDoc(artworkRef);
            
            if (!artworkDoc.exists()) {
                throw new Error('Artwork not found');
            }

            const artworkData = artworkDoc.data();
            console.log('Found artwork:', artworkData);

            try {
                if (status === 'approved') {
                    // First add to approved_artworks
                    const newApprovedRef = await addDoc(collection(db, 'approved_artworks'), {
                        ...artworkData,
                        status: 'approved',
                        verificationStatus: 'approved',
                        verifiedAt: serverTimestamp(),
                        createdAt: serverTimestamp(),
                        originalId: artworkId,
                        verifiedBy: auth.currentUser.uid
                    });
                    console.log('Added to approved_artworks:', newApprovedRef.id);
                    
                    // Then delete from original collection
                    await deleteDoc(artworkRef);
                    console.log('Deleted from artworks collection');
                } else {
                    // Just delete rejected artwork
                    await deleteDoc(artworkRef);
                    console.log('Rejected artwork deleted');
                }
                
                return { success: true };
            } catch (error) {
                console.error('Error during verification:', error);
                throw new Error('Failed to update artwork status: ' + error.message);
            }
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
        const artworksRef = collection(db, 'artworks');
        await addDoc(artworksRef, {
            ...artworkData,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error submitting artwork:', error);
        return false;
    }
}

console.log('Firebase services ready');