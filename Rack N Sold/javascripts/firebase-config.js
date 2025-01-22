// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.appspot.com",
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772"
};

// Initialize Firebase with compatibility version
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize services
    const db = firebase.firestore();
    const auth = firebase.auth();
    const storage = firebase.storage();

    // Make services available globally
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    window.firebase = firebase;
}

console.log('Firebase configured with project:', firebaseConfig.projectId);
