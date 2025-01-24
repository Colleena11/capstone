// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is logged in
        const user = firebase.auth().currentUser;
        if (!user) {
            // Wait briefly to see if auth state updates
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check again after waiting
            if (!firebase.auth().currentUser) {
                window.location.href = './login.html';
                return;
            }
        }
        
        // Load artworks
        loadApprovedArtworks();
    } catch (error) {
        console.error('Gallery initialization error:', error);
        window.location.href = './login.html';
    }
});

async function loadApprovedArtworks() {
    const artworksGrid = document.getElementById('artworks-grid');
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = './login.html';
            return;
        }

        // Verify buyer role
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || userData.role !== 'buyer') {
            window.location.href = './login.html';
            return;
        }

        const snapshot = await firebase.firestore()
            .collection('approved_artworks')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            artworksGrid.innerHTML = '<div class="no-artworks">No artworks available.</div>';
            return;
        }

        const artworksHTML = snapshot.docs.map(doc => {
            const artwork = doc.data();
            return `
                <div class="artwork-card" data-id="${doc.id}">
                    <img src="${artwork.imageUrl || '../images/sample.png'}" 
                         alt="${artwork.title}"
                         onerror="this.src='../images/sample.png'">
                    <div class="artwork-details">
                        <h3>${artwork.title}</h3>
                        <p class="artist">By ${artwork.artist}</p>
                        <p class="price">$${artwork.price.toFixed(2)}</p>
                        <p class="description">${artwork.description}</p>
                        <button class="add-to-cart-btn" onclick="addToCart('${doc.id}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        artworksGrid.innerHTML = artworksHTML;
    } catch (error) {
        console.error('Error loading artworks:', error);
        artworksGrid.innerHTML = '<div class="error-message">Failed to load artworks. Please try again later.</div>';
    }
}

async function addToCart(artworkId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            window.location.href = './login.html';
            return;
        }

        // Get artwork details
        const artworkDoc = await firebase.firestore()
            .collection('approved_artworks')
            .doc(artworkId)
            .get();

        if (!artworkDoc.exists) {
            throw new Error('Artwork not found');
        }

        const artworkData = artworkDoc.data();

        // Add to cart
        await firebase.firestore().collection('cart').add({
            artworkId: artworkId,
            userId: user.uid,
            title: artworkData.title,
            artist: artworkData.artist,
            price: artworkData.price,
            imageUrl: artworkData.imageUrl || '',
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Added to cart successfully!');
    } catch (error) {
        console.error('Add to cart error:', error);
        alert(error.message || 'Failed to add to cart');
    }
}
