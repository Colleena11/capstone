document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await checkBuyerAuth();
        loadUserProfile(user);
        setupEventListeners();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '../Accounts/accounts.html';
    }
});

async function loadUserProfile(user) {
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        const userData = userDoc.data();
        
        document.getElementById('userName').textContent = userData.username || 'N/A';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('memberSince').textContent = new Date(user.metadata.creationTime).toLocaleDateString();
        
        if (userData.profileImage) {
            document.getElementById('profileImage').src = userData.profileImage;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile information');
    }
}

function setupEventListeners() {
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        // Implement edit profile functionality
        alert('Edit profile feature coming soon!');
    });

    document.getElementById('orderHistoryBtn').addEventListener('click', () => {
        // Implement order history functionality
        alert('Order history feature coming soon!');
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = '../Accounts/accounts.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Failed to logout');
        }
    });
}
