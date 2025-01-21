// Import Firebase services from firebase.js
import { db, auth } from './firebase.js';
import { collection, getDocs, addDoc, query, where, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('artworks-container');
    
    try {
        // Show loading state
        container.innerHTML = '<p class="loading">Loading artworks...</p>';

        console.log('Loading approved artworks...');
        
        // Create query using the imported Firestore methods
        const artworksRef = collection(db, 'approved_artworks');
        const artworksQuery = query(
            artworksRef,
            orderBy('approvedAt', 'desc')
        );
            
        try {
            const snapshot = await getDocs(artworksQuery);
            const artworks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched approved artworks:', artworks);
            displayArtworks(artworks);
        } catch (orderError) {
            if (orderError.code === 'failed-precondition') {
                // If index doesn't exist, fetch without ordering
                console.log('Fetching without ordering (index not ready)');
                const basicQuery = query(artworksRef);
                const snapshot = await getDocs(basicQuery);
                const artworks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                displayArtworks(artworks);
                
                // Show index creation message
                showNotification(
                    'Gallery is being optimized. Some features may be limited temporarily.',
                    'info'
                );
            } else {
                throw orderError;
            }
        }
    } catch (error) {
        console.error('Error loading artworks:', error);
        if (error.code === 'failed-precondition' || error.code === 'resource-exhausted') {
            container.innerHTML = `
                <p class="error-message">
                    Setting up the gallery. Please wait a few minutes and try again.
                    <br>
                    <small>First-time setup in progress...</small>
                </p>`;
        } else {
            container.innerHTML = 
                '<p class="error-message">Failed to load artworks. Please try again later.</p>';
        }
    }
});

function displayArtworks(artworks) {
    const container = document.getElementById('artworks-container');
    
    if (!artworks || artworks.length === 0) {
        container.innerHTML = '<p class="no-artworks">No artworks available.</p>';
        return;
    }

    const artworksHTML = artworks.map(artwork => createArtworkCard(artwork)).join('');
    container.innerHTML = artworksHTML;
}

function createArtworkCard(artwork) {
    return `
        <div class="artwork-card" data-id="${artwork.id}">
            <div class="artwork-image">
                <img src="${artwork.imageUrl || '../../images/sample.png'}" 
                     alt="${artwork.title}"
                     onerror="this.src='images/sample.png'">
            </div>
            <div class="artwork-details">
                <h3>${artwork.title}</h3>
                <p class="artist">By ${artwork.artist}</p>
                <p class="price">$${artwork.price.toFixed(2)}</p>
                <p class="description">${artwork.description}</p>
                <button onclick="addToCart('${artwork.id}')" class="add-to-cart-btn">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Update addToCart function to use proper Firestore methods
window.addToCart = async (artworkId) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            showNotification('Please login to add items to cart', 'error');
            return;
        }

        // Get the artwork details from approved_artworks collection
        const artworkRef = doc(db, 'approved_artworks', artworkId);
        const artworkDoc = await getDoc(artworkRef);
        
        if (!artworkDoc.exists()) {
            throw new Error('Artwork not found');
        }

        const artworkData = artworkDoc.data();

        // Create a cart item with all necessary fields
        const cartItem = {
            userId: user.uid,
            artworkId: artworkId,
            title: artworkData.title || 'Untitled',
            price: Number(artworkData.price) || 0,
            artist: artworkData.artist || 'Unknown Artist',
            description: artworkData.description || '',
            addedAt: new Date().toISOString(), // Use ISO string for consistent date format
            quantity: 1,
            // Include these additional fields for display
            imageUrl: artworkData.imageUrl || null
        };

        // Add to cart collection
        const cartRef = collection(db, 'cart');
        await addDoc(cartRef, cartItem);

        showNotification('Added to cart successfully!', 'success');
    } catch (error) {
        console.error('Add to cart failed:', error);
        showNotification('Failed to add to cart: ' + error.message, 'error');
    }
};

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
