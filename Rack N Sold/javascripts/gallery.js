document.addEventListener('DOMContentLoaded', async () => {
    const artworksContainer = document.getElementById('artworks-container');

    async function loadArtworks() {
        try {
            const snapshot = await db.collection('artworks').get();
            artworksContainer.innerHTML = '';

            snapshot.forEach(doc => {
                const artwork = doc.data();
                const artworkElement = document.createElement('div');
                artworkElement.className = 'artwork-item';
                artworkElement.innerHTML = `
                    <img src="${artwork.imageUrl}" alt="${artwork.title}">
                    <div class="artwork-details">
                        <h3>${artwork.title}</h3>
                        <p>Artist: ${artwork.artist}</p>
                        <p class="price">₱${artwork.price.toFixed(2)}</p>
                        <button onclick="addToCart('${doc.id}')" class="add-to-cart-btn">
                            Add to Cart
                        </button>
                        <button onclick="removeFromGallery('${doc.id}')" class="remove-btn">
                            Remove
                        </button>
                    </div>
                `;
                artworksContainer.appendChild(artworkElement);
            });
        } catch (error) {
            console.error('Error loading artworks:', error);
            artworksContainer.innerHTML = '<p class="error">Error loading artworks</p>';
        }
    }

    window.addToCart = async (artworkId) => {
        try {
            await window.firebaseServices.addToCart(artworkId);
            alert('Added to cart successfully!');
        } catch (error) {
            console.error('Add to cart failed:', error);
            if (error.message.includes('auth')) {
                alert('Please login to add items to cart');
            } else {
                alert('Failed to add to cart: ' + error.message);
            }
        }
    };

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

    // Load artworks when page loads
    await loadArtworks();
});
