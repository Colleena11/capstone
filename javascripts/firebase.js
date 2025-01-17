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
    async uploadArtwork(data) {
        try {
            let imageUrl = null;
            if (data.imageFile) {
                const storageRef = storage.ref();
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
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            };

            // Save to pending_artworks collection
            await db.collection('pending_artworks').add(artworkData);
            return { success: true };
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    },

    async verifyArtwork(artworkId, status) {
        const artworkRef = db.collection('pending_artworks').doc(artworkId);
        
        try {
            const doc = await artworkRef.get();
            if (!doc.exists) {
                throw new Error('Artwork not found');
            }

            const artworkData = doc.data();
            
            if (status === 'approved') {
                // Move to approved artworks collection
                await addDoc(collection(db, 'approved_artworks'), {
                    ...artworkData,
                    status: 'approved',
                    approvedAt: new Date().toISOString()
                });
            }

            // Delete from pending
            await artworkRef.delete();
            return { success: true };
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
            const querySnapshot = await getDocs(collection(db, 'approved_artworks'));
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
