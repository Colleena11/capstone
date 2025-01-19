document.addEventListener('DOMContentLoaded', () => {
    const pendingContainer = document.getElementById('pending-container');
    
    // Set up real-time listener for pending artworks
    function setupPendingArtworksListener() {
        db.collection('pending_artworks')
            .orderBy('submittedAt', 'desc')
            .onSnapshot((snapshot) => {
                console.log('Received pending artworks update');
                
                snapshot.docChanges().forEach((change) => {
                    const artwork = { id: change.doc.id, ...change.doc.data() };
                    
                    if (change.type === 'added') {
                        // Add new artwork to display
                        addArtworkToDisplay(artwork);
                    } else if (change.type === 'removed') {
                        // Remove artwork from display
                        removeArtworkFromDisplay(artwork.id);
                    }
                });
            }, (error) => {
                console.error('Error listening to pending artworks:', error);
            });
    }

    function addArtworkToDisplay(artwork) {
        const artworkElement = createArtworkElement(artwork);
        pendingContainer.insertAdjacentHTML('afterbegin', artworkElement);
    }

    function removeArtworkFromDisplay(artworkId) {
        const element = document.querySelector(`[data-id="${artworkId}"]`);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 500);
        }
    }

    function createArtworkElement(artwork) {
        return `
            <div class="artwork-card" data-id="${artwork.id}">
                <img src="${artwork.imageUrl}" alt="${artwork.title}" 
                     onerror="this.src='../images/sample.png'">
                <div class="artwork-details">
                    <h3>${artwork.title || 'Untitled'}</h3>
                    <p class="artist">By ${artwork.artist || 'Unknown Artist'}</p>
                    <p class="price">$${(artwork.price || 0).toFixed(2)}</p>
                    <p class="description">${artwork.description || 'No description provided'}</p>
                    <p class="timestamp">Submitted: ${new Date(artwork.submittedAt?.toDate()).toLocaleString()}</p>
                    <div class="action-buttons">
                        <button class="approve-btn" onclick="handleArtwork('${artwork.id}', 'approved')">
                            Approve
                        </button>
                        <button class="reject-btn" onclick="handleArtwork('${artwork.id}', 'rejected')">
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize
    setupPendingArtworksListener();
    console.log('Admin dashboard initialized');

    window.handleArtwork = async (artworkId, status) => {
        try {
            const card = document.querySelector(`[data-id="${artworkId}"]`);
            if (card) {
                card.classList.add('processing');
            }

            await window.firebaseServices.verifyArtwork(artworkId, status);
            
            // Add fade-out animation
            if (card) {
                card.classList.add('fade-out');
                setTimeout(() => {
                    card.remove();
                    // Check if no more pending items
                    if (!pendingContainer.children.length) {
                        pendingContainer.innerHTML = '<p class="no-items">No pending artworks</p>';
                    }
                }, 500);
            }

            // Show notification
            showNotification(`Artwork ${status === 'approved' ? 'approved' : 'declined'} successfully`, 'success');
        } catch (error) {
            console.error('Action failed:', error);
            showNotification('Error processing artwork', 'error');
            if (card) {
                card.classList.remove('processing');
            }
        }
    };

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});
