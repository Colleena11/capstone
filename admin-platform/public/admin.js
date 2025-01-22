import firebaseServices, { db, auth } from '../../Rack N Sold/javascripts/firebase.js';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const pendingContainer = document.getElementById('pending-container');
    const approvedContainer = document.getElementById('approved-container');

    if (!firebaseServices) {
        console.error('Firebase services not initialized');
        return;
    }

    // Set up listener for pending artworks (changed from 'artworks' to include status filter)
    const pendingRef = collection(db, 'artworks');
    const pendingQuery = query(
        pendingRef, 
        orderBy('createdAt', 'desc')
    );

    // Set up listener for approved artworks
    const approvedRef = collection(db, 'approved_artworks');
    const approvedQuery = query(approvedRef, orderBy('createdAt', 'desc'));

    // Listen for pending artworks
    onSnapshot(pendingQuery, (snapshot) => {
        pendingContainer.innerHTML = '';
        snapshot.docs
            .filter(doc => !doc.data().status || doc.data().status === 'pending')
            .forEach((doc) => {
                const artwork = { id: doc.id, ...doc.data() };
                const artworkElement = createArtworkElement(artwork);
                pendingContainer.insertAdjacentHTML('beforeend', artworkElement);
            });

        if (pendingContainer.innerHTML === '') {
            pendingContainer.innerHTML = '<p class="no-items">No pending artworks</p>';
        }
    });

    // Listen for approved artworks
    onSnapshot(approvedQuery, (snapshot) => {
        approvedContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const artwork = { id: doc.id, ...doc.data() };
            const artworkElement = createApprovedArtworkElement(artwork);
            approvedContainer.insertAdjacentHTML('beforeend', artworkElement);
        });

        if (snapshot.empty) {
            approvedContainer.innerHTML = '<p class="no-items">No approved artworks</p>';
        }
    });
});

function createArtworkElement(artwork) {
    const timestamp = artwork.createdAt?.toDate ? 
        new Date(artwork.createdAt.toDate()).toLocaleString() : 
        'Date not available';

    return `
        <div class="artwork-card" data-id="${artwork.id}">
            <div class="artwork-details">
                <h3>${artwork.title}</h3>
                <p class="artist">By ${artwork.artist}</p>
                <p class="price">$${artwork.price.toFixed(2)}</p>
                <p class="description">${artwork.description}</p>
                <p class="timestamp">Submitted: ${timestamp}</p>
                <p class="status">Status: ${artwork.status || 'pending'}</p>
                <div class="action-buttons">
                    <button onclick="handleApproval('${artwork.id}', true)" class="approve-btn">
                        Approve
                    </button>
                    <button onclick="handleApproval('${artwork.id}', false)" class="reject-btn">
                        Reject
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createApprovedArtworkElement(artwork) {
    const approvedAt = artwork.approvedAt?.toDate ? 
        new Date(artwork.approvedAt.toDate()).toLocaleString() : 'Date not available';
    const submittedAt = artwork.submittedAt?.toDate ? 
        new Date(artwork.submittedAt.toDate()).toLocaleString() : 'Date not available';

    return `
        <div class="artwork-card" data-id="${artwork.id}">
            <div class="artwork-details">
                <h3>${artwork.title}</h3>
                <p class="artist">By ${artwork.artist}</p>
                <p class="price">₱${artwork.price.toFixed(2)}</p>
                <p class="description">${artwork.description}</p>
                <p class="timestamp">Submitted: ${submittedAt}</p>
                <p class="timestamp">Approved: ${approvedAt}</p>
                <p class="status">Status: Approved</p>
            </div>
        </div>
    `;
}

// Simplified handleApproval function
window.handleApproval = async function(artworkId, isApproved) {
    try {
        if (!auth.currentUser) {
            showNotification('Please sign in first', 'error');
            return;
        }

        showNotification('Processing...', 'info');
        
        await firebaseServices.verifyArtwork(artworkId, isApproved ? 'approved' : 'rejected');
        
        showNotification(
            `Artwork ${isApproved ? 'approved' : 'rejected'} successfully!`, 
            'success'
        );
    } catch (error) {
        console.error('Approval error:', error);
        showNotification(
            `Error: ${error.message || 'Failed to process artwork'}`, 
            'error'
        );
    }
};

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add styles for the admin interface
const style = document.createElement('style');
style.textContent = `
    .artwork-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }

    .artwork-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .artwork-details h3 {
        margin: 0 0 10px 0;
        color: #333;
    }

    .artist, .price, .description, .timestamp, .status {
        margin: 5px 0;
        color: #666;
    }

    .price {
        font-weight: bold;
        color: #2ecc71;
    }

    .action-buttons {
        margin-top: 15px;
        display: flex;
        gap: 10px;
    }

    .approve-btn, .reject-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .approve-btn {
        background-color: #2ecc71;
        color: white;
    }

    .reject-btn {
        background-color: #e74c3c;
        color: white;
    }

    .approve-btn:hover {
        background-color: #27ae60;
    }

    .reject-btn:hover {
        background-color: #c0392b;
    }

    .fade-out {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.5s ease;
    }

    .admin-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }
    
    .admin-notification.success {
        background-color: #2ecc71;
    }
    
    .admin-notification.error {
        background-color: #e74c3c;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .no-items, .error {
        text-align: center;
        padding: 20px;
        color: #666;
    }

    .error {
        color: #e74c3c;
    }
`;
document.head.appendChild(style);