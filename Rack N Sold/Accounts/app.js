// Initialize Firebase (replace with your config)
const firebaseConfig = {
    // Your Firebase config object
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const profileSection = document.getElementById('profileSection');
const editForm = document.getElementById('editForm');
const updateProfileForm = document.getElementById('updateProfileForm');
const editProfileBtn = document.getElementById('editProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeHeader = document.getElementById('welcomeHeader');

// Check authentication state
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Update UI with user data
        document.getElementById('userName').textContent = userData.name || 'No name set';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('memberSince').textContent = new Date(user.metadata.creationTime).toLocaleDateString();
        welcomeHeader.textContent = `Welcome, ${userData.name || 'User'}`;

        if (userData.profilePicture) {
            document.getElementById('profilePicture').src = userData.profilePicture;
        }
    } else {
        window.location.href = '../login/index.html';
    }
});

// Edit Profile Button
editProfileBtn.addEventListener('click', () => {
    editForm.classList.toggle('hidden');
    const userData = document.getElementById('userName').textContent;
    document.getElementById('nameInput').value = userData;
});

// Update Profile Form
updateProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const newName = document.getElementById('nameInput').value;
    const profilePicFile = document.getElementById('profilePicInput').files[0];

    try {
        const updateData = { name: newName };

        if (profilePicFile) {
            const storageRef = storage.ref(`profilePictures/${user.uid}`);
            await storageRef.put(profilePicFile);
            const downloadURL = await storageRef.getDownloadURL();
            updateData.profilePicture = downloadURL;
            document.getElementById('profilePicture').src = downloadURL;
        }

        await db.collection('users').doc(user.uid).update(updateData);
        document.getElementById('userName').textContent = newName;
        welcomeHeader.textContent = `Welcome, ${newName}`;
        editForm.classList.add('hidden');
        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        showAlert('Error updating profile: ' + error.message, 'error');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            window.location.href = '../login/index.html';
        })
        .catch(error => {
            showAlert('Error signing out: ' + error.message, 'error');
        });
});

// Helper function to show alerts
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    profileSection.insertBefore(alert, profileSection.firstChild);
    setTimeout(() => alert.remove(), 3000);
}
