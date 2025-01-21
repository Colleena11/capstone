document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Make sure Firebase is initialized
        if (!window.firebase) {
            console.error('Firebase not initialized');
            return;
        }

        await loadPendingArtworks();
    } catch (error) {
        console.error('Error initializing admin page:', error);
        document.getElementById('pending-container').innerHTML = 
            '<p class="error-message">Failed to load pending artworks. Please try again later.</p>';
    }
});

async function loadPendingArtworks() {
    try {
        const snapshot = await firebase.firestore()
            .collection('pending_artworks')
            .get();

        const artworks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        displayPendingArtworks(artworks);
    } catch (error) {
        console.error('Error loading pending artworks:', error);
        throw error;
    }
}

function displayPendingArtworks(artworks) {
    const container = document.getElementById('pending-container');
    
    if (!artworks || artworks.length === 0) {
        container.innerHTML = '<p class="no-artworks">No pending artworks.</p>';
        return;
    }

    const artworksHTML = artworks.map(artwork => `
        <div class="artwork-card" data-id="${artwork.id}">
            <img src="${artwork.imageUrl}" alt="${artwork.title}">
            <div class="artwork-details">
                <h3>${artwork.title}</h3>
                <p>Artist: ${artwork.artist}</p>
                <p>Price: $${artwork.price}</p>
                <p>${artwork.description}</p>
                <div class="action-buttons">
                    <button onclick="approveArtwork('${artwork.id}')" class="approve-btn">Approve</button>
                    <button onclick="rejectArtwork('${artwork.id}')" class="reject-btn">Reject</button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = artworksHTML;
}

async function approveArtwork(artworkId) {
    try {
        const db = firebase.firestore();
        
        // Get the artwork data from pending collection
        const artworkDoc = await db.collection('pending_artworks').doc(artworkId).get();
        if (!artworkDoc.exists) {
            throw new Error('Artwork not found');
        }

        const artworkData = artworkDoc.data();

        // Add to artworks collection (for gallery display)
        await db.collection('artworks').add({
            ...artworkData,
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Delete from pending collection
        await db.collection('pending_artworks').doc(artworkId).delete();

        // Remove the artwork card from the DOM
        const artworkCard = document.querySelector(`.artwork-card[data-id="${artworkId}"]`);
        if (artworkCard) {
            artworkCard.remove();
        }

        alert('Artwork approved successfully!');
        
        // Refresh the pending artworks display
        await loadPendingArtworks();
    } catch (error) {
        console.error('Error approving artwork:', error);
        alert('Failed to approve artwork. Please try again.');
    }
}

async function rejectArtwork(artworkId) {
    if (confirm('Are you sure you want to reject this artwork?')) {
        try {
            const db = firebase.firestore();
            
            // Get the artwork reference
            const artworkRef = db.collection('pending_artworks').doc(artworkId);
            
            // Get the artwork data to delete the image if needed
            const artworkDoc = await artworkRef.get();
            const artworkData = artworkDoc.data();

            // If there's an image URL, delete it from storage
            if (artworkData.imageUrl && artworkData.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                const storage = firebase.storage();
                const imageRef = storage.refFromURL(artworkData.imageUrl);
                await imageRef.delete();
            }

            // Delete the document from Firestore
            await artworkRef.delete();

            // Remove the artwork card from the DOM
            const artworkCard = document.querySelector(`.artwork-card[data-id="${artworkId}"]`);
            if (artworkCard) {
                artworkCard.remove();
            }

            alert('Artwork rejected and removed.');
            
            // Refresh the pending artworks display
            await loadPendingArtworks();
        } catch (error) {
            console.error('Error rejecting artwork:', error);
            alert('Failed to reject artwork. Please try again.');
        }
    }
}
