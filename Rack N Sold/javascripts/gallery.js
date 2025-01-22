// Import Firebase services from firebase.js
import { db, auth } from './firebase.js';
import { collection, getDocs, addDoc, query, where, orderBy, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import firebaseServices from './firebase.js';

async function displayArtworks() {
    const container = document.getElementById('artworks-container');
    container.innerHTML = 'Loading...';

    try {
        console.log('Fetching artworks...');
        const artworks = await firebaseServices.getArtworks();
        console.log('Fetched artworks:', artworks);

        if (!artworks || artworks.length === 0) {
            container.innerHTML = '<p>No artworks available.</p>';
            return;
        }

        container.innerHTML = artworks.map(artwork => `
            <div class="artwork-card">
                <img src="${artwork.imageUrl || 'images/placeholder.png'}" alt="${artwork.title}">
                <h3>${artwork.title}</h3>
                <p class="artist">Artist: ${artwork.artist}</p>
                <p class="price">$${artwork.price}</p>
                <p class="description">${artwork.description}</p>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error displaying artworks:', error);
        container.innerHTML = '<p>Error loading artworks.</p>';
    }
}

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', displayArtworks);

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `gallery-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .gallery-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }
    
    .gallery-notification.success {
        background-color: #4CAF50;
    }
    
    .gallery-notification.error {
        background-color: #f44336;
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

    .artwork-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s;
    }

    .artwork-card:hover {
        transform: translateY(-5px);
    }

    .artwork-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
    }

    .artwork-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .artwork-details {
        padding: 15px;
    }

    .artwork-details h3 {
        margin: 0 0 10px 0;
        color: #333;
    }

    .price {
        color: #2ecc71;
        font-weight: bold;
        font-size: 1.2em;
    }

    .add-to-cart-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
        transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
        background: #2980b9;
    }
`;
document.head.appendChild(style);

window.removeFromGallery = async (artworkId) => {
    if (confirm('Are you sure you want to remove this artwork?')) {
        try {
            await window.firebaseServices.removeFromGallery(artworkId);
            await loadArtworks(); // Refresh the gallery
        } catch (error) {
            alert('Error removing artwork');
        }
    }
};

// Add to your existing styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .loading {
        text-align: center;
        color: #666;
        padding: 20px;
        font-style: italic;
    }

    .error-message {
        text-align: center;
        color: #e74c3c;
        padding: 20px;
        background: #fde8e7;
        border-radius: 4px;
        margin: 20px;
    }

    .artworks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .no-artworks {
        text-align: center;
        color: #666;
        padding: 40px;
        grid-column: 1 / -1;
    }

    .gallery-notification.info {
        background-color: #3498db;
    }
`;
document.head.appendChild(additionalStyles);
