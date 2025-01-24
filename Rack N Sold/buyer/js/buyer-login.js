// Initialize login form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('buyerLoginForm');
    const logoutButton = document.getElementById('logoutButton');
    
    if (!loginForm && !logoutButton) return;

    if (loginForm) {
        debugLog('Setting up login form');

        // Ensure Firebase persistence is set to LOCAL
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                debugLog('Firebase persistence set to LOCAL');
                setupLoginForm();
            })
            .catch(error => {
                console.error('Persistence error:', error);
                debugLog('Persistence error: ' + error.message);
                setupLoginForm(); // Still setup form even if persistence fails
            });
    }

    // Setup logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                debugLog('User logged out successfully');
                
                // Show login form and hide profile card
                document.getElementById('loginBox').style.display = 'block';
                document.getElementById('profileCard').style.display = 'none';
            } catch (error) {
                console.error('Logout error:', error);
                debugLog('Logout error: ' + error.message);
            }
        });
    }
});

function setupLoginForm() {
    const loginForm = document.getElementById('buyerLoginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            showLoading();
            debugLog('Attempting login...');
            
            // Sign in user
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check if user has buyer role
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData && userData.role === 'buyer') {
                // Successful buyer login
                debugLog('Login successful - buyer role confirmed');
                localStorage.setItem('userRole', 'buyer');
                localStorage.setItem('userId', user.uid);
                showSuccess('Login successful!');
                
                // Update profile card and show it
                document.getElementById('userName').textContent = userData.name || 'Buyer';
                document.getElementById('userEmail').textContent = user.email;
                if (userData.profilePicture) {
                    document.getElementById('profilePicture').src = userData.profilePicture;
                }
                
                // Hide login form and show profile card
                document.getElementById('loginBox').style.display = 'none';
                document.getElementById('profileCard').style.display = 'block';
            } else {
                debugLog('Login failed - not a buyer account');
                await firebase.auth().signOut();
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                showError('This account does not have buyer privileges.');
            }
        } catch (error) {
            debugLog('Login error: ' + error.message);
            console.error('Login error:', error);
            showError(error.message || 'Login failed. Please try again.');
        } finally {
            hideLoading();
        }
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('buyerLoginForm');
    removeMessages();
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('buyerLoginForm');
    removeMessages();
    form.insertBefore(successDiv, form.firstChild);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.textContent = 'Logging in...';
    
    const form = document.getElementById('buyerLoginForm');
    removeMessages();
    form.insertBefore(loadingDiv, form.firstChild);
}

function hideLoading() {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

function removeMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message, .loading-message');
    messages.forEach(message => message.remove());
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
