// ...existing code...

// Add this function to check authentication status
function checkAuth() {
    firebase.auth().onAuthStateChanged(user => {
        const accountLink = document.querySelector('a[href*="Accounts"]');
        if (user) {
            accountLink.style.display = 'block';
        } else {
            accountLink.style.display = 'none';
        }
    });
}

// Call checkAuth when the page loads
document.addEventListener('DOMContentLoaded', checkAuth);
// ...existing code...
