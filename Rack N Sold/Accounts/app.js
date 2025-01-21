import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    onAuthStateChanged,
    signOut,
    sendEmailVerification,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnCDceh11o03SryLLfMPTvsB1ldE6yj2o",
    authDomain: "rack-n--sold-c2bc0.firebaseapp.com",
    projectId: "rack-n--sold-c2bc0",
    storageBucket: "rack-n--sold-c2bc0.appspot.com",
    messagingSenderId: "934643385207",
    appId: "1:934643385207:web:507bd5cdc2dd7568c31772"
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Get DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const registrationForm = document.getElementById('registrationForm');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const closeModalBtn = document.querySelector('.close');
    const loginForm = document.querySelector('.login-form');
    const registrationModal = document.getElementById('registrationModal');
    const profileSection = document.getElementById('profileSection');

    // Debug log
    console.log('Elements loaded:', {
        loginBtn,
        registrationForm,
        loginForm,
        registrationModal
    });

    // Login functionality - Simplified without email verification
    loginBtn?.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Successful login
            alert('Login successful!');
            window.location.href = '../racknsold.html';
        } catch (error) {
            console.error('Login error:', error);
            alert(getErrorMessage(error));
        }
    });

    // Registration form handler - Simplified without email verification
    registrationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const username = document.getElementById('regUsername').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: username
            });

            alert('Registration successful! You can now login.');
            registrationModal.style.display = 'none';
            loginForm.style.display = 'block';
        } catch (error) {
            showError(getErrorMessage(error));
        }
    });

    // Create Account button handler
    createAccountBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        registrationModal.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Close modal handler
    closeModalBtn?.addEventListener('click', () => {
        registrationModal.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Google login handler
    googleLoginBtn?.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../racknsold.html';
        } catch (error) {
            alert('Google login failed: ' + getErrorMessage(error));
        }
    });

    // Facebook login handler
    facebookLoginBtn?.addEventListener('click', async () => {
        const provider = new FacebookAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = '../racknsold.html';
        } catch (error) {
            alert('Facebook login failed: ' + getErrorMessage(error));
        }
    });

    // Logout handler
    logoutBtn?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = '../racknsold.html';
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    });

    // Auth state observer - Simplified without email verification check
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginForm.style.display = 'none';
            profileSection.style.display = 'block';
            
            document.getElementById('userName').textContent = user.displayName || 'N/A';
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('memberSince').textContent = new Date(user.metadata.creationTime).toLocaleDateString();
            document.getElementById('profilePicture').src = user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        } else {
            loginForm.style.display = 'block';
            profileSection.style.display = 'none';
        }
    });
});

// Helper functions
function validatePhone(phone) {
    const phoneRegex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered';
        case 'auth/invalid-email':
            return 'Please enter a valid email address';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed';
        case 'auth/weak-password':
            return 'Please choose a stronger password (at least 6 characters)';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/requires-recent-login':
            return 'Please log in again to continue';
        case 'auth/invalid-credential':
            return 'Invalid login credentials';
        default:
            return error.message;
    }
}

// Helper function to show alerts
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    profileSection.insertBefore(alert, profileSection.firstChild);
    setTimeout(() => alert.remove(), 3000);
}
