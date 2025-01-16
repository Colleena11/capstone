const firebaseConfig = {
    apiKey: "AIzaSyC5IF5N5TZ4mq9J0nAR74u-u-hZUGUhiQc",
    authDomain: "racknsold-fe39d.firebaseapp.com",
    projectId: "racknsold-fe39d",
    storageBucket: "racknsold-fe39d.appspot.com",
    messagingSenderId: "485859376518",
    appId: "1:485859376518:web:b8774faa966f8926325923"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized with project:', firebaseConfig.projectId);
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

// Initialize services
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Make services available globally
window.db = db;
window.storage = storage;
window.auth = auth;
window.firebase = firebase;

console.log('Firebase configured with project:', firebaseConfig.projectId);

// Export Firebase instance
window.firebaseApp = firebase;
