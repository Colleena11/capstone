import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize Firebase using config from window
const app = initializeApp(window.firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Make Firebase instances available globally
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

async function initializeFirebase() {
    try {
        if (!app) {
            app = initializeApp(window.firebaseConfig);
            console.log('Firebase app initialized');
        }
        if (!db) {
            db = getFirestore(app);
            console.log('Firestore initialized');
        }

        // Test connection
        const testRef = collection(db, 'test');
        await getDocs(testRef);
        console.log('Firebase connection successful');
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Export as a module
export const firebaseServices = {
    async initializeFirebase() {
        try {
            if (!window.firebaseApp) {
                console.error('Firebase app not initialized');
                return false;
            }
            console.log('Firebase services ready');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    },

    async getCartItems(userId) {
        try {
            const cartQuery = query(
                collection(window.firebaseDb, 'cart'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(cartQuery);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting cart items:', error);
            throw error;
        }
    },

    async removeFromCart(itemId) {
        try {
            await deleteDoc(doc(window.firebaseDb, 'cart', itemId));
            return true;
        } catch (error) {
            console.error('Error removing item from cart:', error);
            throw error;
        }
    },

    async uploadArtwork(data) {
        try {
            let imageUrl = null;
            if (data.imageFile) {
                const storageRef = window.firebaseStorage.ref();
                const imageRef = storageRef.child(`pending_artworks/${Date.now()}_${data.imageFile.name}`);
                const uploadTask = await imageRef.put(data.imageFile);
                imageUrl = await uploadTask.ref.getDownloadURL();
            }

            const artworkData = {
                title: data.title,
                artist: data.artist,
                price: parseFloat(data.price),
                description: data.description,
                imageUrl: imageUrl || 'images/sample.png',
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };

            // Save to pending_artworks collection using modern Firestore syntax
            await addDoc(collection(window.firebaseDb, 'pending_artworks'), artworkData);
            return { success: true, message: 'Artwork uploaded successfully!' };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    },

    async verifyArtwork(artworkId, status) {
        try {
            const artworkRef = doc(window.firebaseDb, 'pending_artworks', artworkId);
            const docSnap = await getDoc(artworkRef);
            
            if (!docSnap.exists()) {
                throw new Error('Artwork not found');
            }

            const artworkData = docSnap.data();
            
            if (status === 'approved') {
                // Move to approved artworks collection with proper timestamp
                await addDoc(collection(window.firebaseDb, 'approved_artworks'), {
                    ...artworkData,
                    status: 'approved',
                    approvedAt: new Date().toISOString(),
                    approvedBy: window.firebaseAuth.currentUser?.uid || 'system',
                    createdAt: new Date().toISOString(),
                    submittedAt: artworkData.submittedAt || new Date().toISOString()
                });
            }

            // Delete from pending
            await deleteDoc(artworkRef);
            return { success: true, message: 'Artwork verification completed!' };
        } catch (error) {
            console.error('Verification failed:', error);
            throw error;
        }
    },

    async getArtworks() {
        if (!db) await initializeFirebase();
        try {
            const querySnapshot = await getDocs(collection(db, 'artworks'));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    },

    async getApprovedArtworks() {
        if (!db) await initializeFirebase();
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(db, 'approved_artworks'),
                    where('status', '==', 'approved'),
                    orderBy('approvedAt', 'desc')
                )
            );
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Fetch approved artworks error:', error);
            return [];
        }
    },
    // ...existing methods...
};

// Initialize and make services available
initializeFirebase().then(success => {
    if (success) {
        window.firebaseServices = firebaseServices;
        console.log('Firebase services ready');
    } else {
        console.error('Failed to initialize Firebase');
        alert('Could not connect to the server. Please check your internet connection and refresh the page.');
    }
}).catch(error => {
    console.error('Failed to initialize Firebase:', error);
    alert('Could not connect to the server. Please check your internet connection and refresh the page.');
});

export default firebaseServices;
