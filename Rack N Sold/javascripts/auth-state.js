// Initialize Firebase Auth
const auth = firebase.auth();

// Function to handle auth state changes
function handleAuthStateChange(user) {
    try {
        if (user) {
            // User is signed in
            const userInfo = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User'
            };
            
            // Update UI elements if they exist
            const userNameElement = document.getElementById('user-name');
            const loginButton = document.getElementById('login-button');
            const logoutButton = document.getElementById('logout-button');
            
            if (userNameElement) {
                userNameElement.textContent = userInfo.displayName;
            }
            
            if (loginButton) {
                loginButton.style.display = 'none';
            }
            
            if (logoutButton) {
                logoutButton.style.display = 'block';
            }
        } else {
            // User is signed out
            const loginButton = document.getElementById('login-button');
            const logoutButton = document.getElementById('logout-button');
            const userNameElement = document.getElementById('user-name');
            
            if (loginButton) {
                loginButton.style.display = 'block';
            }
            
            if (logoutButton) {
                logoutButton.style.display = 'none';
            }
            
            if (userNameElement) {
                userNameElement.textContent = '';
            }
        }
    } catch (error) {
        console.error('Auth state handler error:', error);
    }
}

// Set up auth state listener
auth.onAuthStateChanged(handleAuthStateChange);

// Handle logout
function handleLogout() {
    try {
        auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Attach logout handler if logout button exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});
