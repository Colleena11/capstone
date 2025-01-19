document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('artworks-container');

    async function loadArtworks() {
        try {
            container.innerHTML = '<p>Loading artworks...</p>';
            const artworks = await window.firebaseServices.getArtworks();
            
            if (!artworks.length) {
                container.innerHTML = '<p>No artworks available</p>';
                return;
            }

            container.innerHTML = artworks.map(artwork => createArtworkCard(artwork)).join('');
        } catch (error) {
            console.error('Failed to load artworks:', error);
            container.innerHTML = '<p>Error loading artworks. Please try again later.</p>';
        }
    }

    function createArtworkCard(artwork) {
        return `
            <div class="artwork-card">
                <img src="${artwork.imageUrl}" alt="${artwork.title}">
                <h3>${artwork.title}</h3>
                <p class="artist">By ${artwork.artist}</p>
                <p class="price">₱${artwork.price.toFixed(2)}</p>
                <button onclick="addToCart('${artwork.id}')" class="add-to-cart-btn">Add to Cart</button>
            </div>
        `;
    }

    // Global function for adding to cart
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

    // Load artworks when page loads
    loadArtworks();
});
