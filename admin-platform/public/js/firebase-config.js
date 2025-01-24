// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.appspot.com",
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Initialize Firestore
const db = firebase.firestore();
