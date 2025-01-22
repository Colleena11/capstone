// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('buyerLoginForm');
    if (!loginForm) return;

    // Wait for Firebase to initialize
    const waitForFirebase = setInterval(() => {
        if (window.firebase && window.auth) {
            clearInterval(waitForFirebase);
            setupLoginForm();
        }
    }, 100);
});

function setupLoginForm() {
    const loginForm = document.getElementById('buyerLoginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // Sign in user using global auth instance
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check if user has buyer role
            const userDoc = await window.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData && userData.role === 'buyer') {
                // Successful buyer login
                localStorage.setItem('userRole', 'buyer');
                localStorage.setItem('userId', user.uid);
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = './gallery.html';  // Redirect to gallery
                }, 1500);
            } else {
                // Not a buyer account
                await window.auth.signOut();
                showError('This account does not have buyer privileges.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please try again.');
        }
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('buyerLoginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('buyerLoginForm');
    form.insertBefore(successDiv, form.firstChild);
}

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Update UI for logged-in user
        const accountLink = document.querySelector('a[href*="login.html"]');
        if (accountLink) {
            accountLink.href = './gallery.html'; // Update this to point to gallery
            accountLink.textContent = 'My Account';
        }
    }
});
