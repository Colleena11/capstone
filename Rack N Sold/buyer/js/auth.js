// Utility function to check if user is authenticated and has buyer role
async function checkBuyerAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // Check if user is a buyer
                firebase.firestore().collection('users')
                    .doc(user.uid)
                    .get()
                    .then((doc) => {
                        if (doc.exists && doc.data().role === 'buyer') {
                            resolve(user);
                        } else {
                            // Redirect non-buyers to main page
                            window.location.href = '../racknsold.html';
                            reject(new Error('Access denied: Buyers only'));
                        }
                    })
                    .catch(reject);
            } else {
                window.location.href = '../Accounts/accounts.html';
                reject(new Error('User not authenticated'));
            }
        });
    });
}

// Update gallery and cart pages to redirect to buyer home page
function redirectToBuyerHome() {
    window.location.href = './home.html';
}

// Export for use in other files
window.checkBuyerAuth = checkBuyerAuth;
