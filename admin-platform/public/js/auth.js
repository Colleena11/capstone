// Admin authentication check
async function checkAuth() {
    return new Promise((resolve, reject) => {
        let isRedirecting = false;
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            console.log('Current user:', user?.email);
            console.log('Current path:', window.location.pathname);
            
            const isLoginPage = window.location.pathname.endsWith('login.html');
            
            if (user && user.email === 'admin@gmail.com') {
                console.log('Admin authenticated');
                unsubscribe();
                if (isLoginPage && !isRedirecting) {
                    isRedirecting = true;
                    console.log('Redirecting to index.html');
                    window.location.href = 'index.html';
                }
                resolve(user);
            } else {
                console.log('Not authenticated as admin');
                if (user) {
                    firebase.auth().signOut();
                }
                
                if (!isLoginPage && !isRedirecting) {
                    isRedirecting = true;
                    console.log('Redirecting to login.html');
                    window.location.href = 'login.html';
                }
                reject(new Error('Unauthorized access'));
            }
        });
    });
}

// Export for use in other files
window.checkAuth = checkAuth;
