import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let app, db;

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

const firebaseServices = {
    async uploadArtwork(artworkData) {
        if (!db) await initializeFirebase();
        try {
            const docRef = await addDoc(collection(db, 'artworks'), {
                ...artworkData,
                createdAt: new Date().toISOString()
            });
            return { success: true, id: docRef.id, data: { ...artworkData, id: docRef.id } };
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to save artwork. Please try again.');
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
