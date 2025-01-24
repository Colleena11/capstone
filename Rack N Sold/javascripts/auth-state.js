// Initialize Firebase Auth state management
let isAuthStateInitialized = false;

// Helper function to get current page info
function getCurrentPageInfo() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const page = parts[parts.length - 1].toLowerCase();
    const isInBuyerFolder = parts.includes('buyer');
    
    return {
        currentPage: page,
        isLoginPage: page === 'login.html',
        isBuyerOnlyPage: ['gallery.html'].includes(page),
        isInBuyerFolder
    };
}

// Helper function to update navigation
function updateNavigation(isLoggedIn, isBuyer) {
    const accountLinks = document.querySelectorAll('a[href*="login.html"], a[href*="account.html"]');
    accountLinks.forEach(link => {
        if (isLoggedIn && isBuyer) {
            link.href = './gallery.html';
            link.textContent = 'My Account';
        } else {
            link.href = './login.html';
            link.textContent = 'Account';
        }
    });
}

// Initialize auth state listener
function initAuthStateListener() {
    if (isAuthStateInitialized) return;
    isAuthStateInitialized = true;

    firebase.auth().onAuthStateChanged(async (user) => {
        const { currentPage, isLoginPage, isBuyerOnlyPage } = getCurrentPageInfo();
        debugLog('Auth state changed. Current page: ' + currentPage);
        
        try {
            if (user) {
                debugLog('User is signed in: ' + user.email);
                
                // Check if user is a buyer
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (userData && userData.role === 'buyer') {
                    // Valid buyer
                    debugLog('Valid buyer account');
                    localStorage.setItem('userRole', 'buyer');
                    localStorage.setItem('userId', user.uid);
                    
                    // Update navigation
                    updateNavigation(true, true);
                    
                    // Only redirect if we're on the login page
                    if (isLoginPage && !window.preventRedirect) {
                        debugLog('Redirecting to gallery');
                        window.location.href = './gallery.html';
                    }
                } else {
                    // Not a buyer
                    debugLog('Non-buyer account, signing out');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    await firebase.auth().signOut();
                    
                    // Update navigation
                    updateNavigation(false, false);
                }
            } else {
                // User is signed out
                debugLog('User is signed out');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                
                // Update navigation
                updateNavigation(false, false);
                
                // Redirect if on buyer-only page
                if (isBuyerOnlyPage) {
                    window.location.href = './login.html';
                }
            }
        } catch (error) {
            console.error('Auth state error:', error);
            debugLog('Auth state error: ' + error.message);
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            
            // Update navigation
            updateNavigation(false, false);
        }
    });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Initializing auth state listener');
    initAuthStateListener();
});
