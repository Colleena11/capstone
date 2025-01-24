document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    setLoadingState(true);
    try {
        const user = await checkBuyerAuth();
        await loadUserProfile(user);
        setupEventListeners();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html'; // Changed from '../account.html'
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(isLoading) {
    const elements = ['userName', 'userEmail', 'memberSince'];
    elements.forEach(id => {
        document.getElementById(id).textContent = isLoading ? 'Loading...' : '';
    });
}

async function loadUserProfile(user) {
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();

        if (!userDoc.exists) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        
        // Update profile information with validation
        document.getElementById('userName').textContent = userData.username || 'No username set';
        document.getElementById('userEmail').textContent = user.email || 'No email available';
        document.getElementById('memberSince').textContent = user.metadata.creationTime ? 
            new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown';
        
        if (userData.profileImage) {
            const profileImg = document.getElementById('profileImage');
            profileImg.src = userData.profileImage;
            profileImg.onerror = () => {
                profileImg.src = '../images/default-profile.png';
            };
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile information. Please try again later.');
    }
}

function setupEventListeners() {
    // Edit Profile
    document.getElementById('editProfileBtn').addEventListener('click', async () => {
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('No user logged in');

            // Add your edit profile logic here
            const newUsername = prompt('Enter new username:');
            if (newUsername) {
                await firebase.firestore()
                    .collection('users')
                    .doc(user.uid)
                    .update({ username: newUsername });
                document.getElementById('userName').textContent = newUsername;
                showSuccess('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Edit profile error:', error);
            showError('Failed to update profile');
        }
    });

    // Order History
    document.getElementById('orderHistoryBtn').addEventListener('click', () => {
        window.location.href = 'order-history.html';
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('Failed to logout. Please try again.');
        }
    });
}

function showError(message) {
    alert(message); // Replace with better UI notification system
}

function showSuccess(message) {
    alert(message); // Replace with better UI notification system
}
