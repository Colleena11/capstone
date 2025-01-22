import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
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

document.getElementById('buyerRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;

    if (!validateForm(password, confirmPassword)) return;

    try {
        // First create the user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Wait a moment for auth to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create user profile in Firestore
        try {
            // Basic user data
            const userData = {
                fullName,
                email,
                phone,
                role: 'buyer',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'active',
                profileComplete: true,
                uid: user.uid
            };

            // Create both documents in parallel
            await Promise.all([
                setDoc(doc(db, 'users', user.uid), userData),
                setDoc(doc(db, 'buyers', user.uid), {
                    ...userData,
                    registeredAt: new Date().toISOString(),
                    purchases: [],
                    cartItems: []
                })
            ]);

            showSuccess('Registration successful! Redirecting to login...');
            
            // Sign out and redirect
            await auth.signOut();
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);

        } catch (profileError) {
            console.error('Error creating profile:', profileError);
            // Clean up on failure
            await user.delete();
            throw new Error('Failed to create user profile. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showError('This email is already registered. Please use a different email or login.');
        } else {
            showError(error.message || 'Registration failed. Please try again.');
        }
    }
});

function validateForm(password, confirmPassword) {
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return false;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long!');
        return false;
    }

    return true;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('buyerRegisterForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('buyerRegisterForm');
    form.insertBefore(successDiv, form.firstChild);
}

// Add password validation feedback
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    this.style.borderColor = strength.color;
});

function checkPasswordStrength(password) {
    if (password.length < 6) {
        return { color: '#ff4444' }; // Red for weak
    } else if (password.length < 8) {
        return { color: '#ffbb33' }; // Orange for medium
    } else {
        return { color: '#00C851' }; // Green for strong
    }
}

// Phone number validation
document.getElementById('phone').addEventListener('input', function(e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
});
