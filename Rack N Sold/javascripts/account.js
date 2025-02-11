// Function to handle user sign out
function signOut() {
    auth.signOut().then(() => {
        window.location.href = 'home.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Function to update profile information
function updateProfile() {
    const user = auth.currentUser;
    const displayName = document.getElementById('displayName').value;
    const email = document.getElementById('email').value;

    if (user) {
        // Update display name
        user.updateProfile({
            displayName: displayName
        }).then(() => {
            // Update email if changed
            if (email !== user.email) {
                return user.updateEmail(email);
            }
        }).then(() => {
            showNotification('Profile updated successfully!', 'success');
        }).catch((error) => {
            showNotification('Error updating profile: ' + error.message, 'error');
        });
    }
}

// Function to show notification
function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to load user profile
function loadUserProfile() {
    const user = auth.currentUser;
    if (user) {
        const displayNameInput = document.getElementById('displayName');
        const emailInput = document.getElementById('email');
        const profileImage = document.getElementById('profileImage');

        if (displayNameInput) displayNameInput.value = user.displayName || '';
        if (emailInput) emailInput.value = user.email || '';
        if (profileImage) {
            profileImage.src = user.photoURL || '../images/default-profile.png';
            profileImage.alt = user.displayName || 'Profile Image';
        }
    }
}

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadUserProfile();
        } else {
            window.location.href = 'home.html';
        }
    });
});
