document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('artworkForm');
    const preview = document.getElementById('photo-pic');
    const submitBtn = form.querySelector('button[type="submit"]');
    const fileInput = document.getElementById('input-file');

    let currentImagePreviewUrl = 'images/sample.png';

    // Update image preview handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentImagePreviewUrl = URL.createObjectURL(file);
            preview.src = currentImagePreviewUrl;
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        
        try {
            const imageFile = fileInput.files[0];
            if (!imageFile) {
                throw new Error('Please select an image');
            }

            const artworkData = {
                title: document.getElementById('artTitle').value.trim(),
                artist: document.getElementById('artistName').value.trim(),
                price: parseFloat(document.getElementById('price').value),
                description: document.getElementById('description').value.trim(),
                imageFile: imageFile
            };

            console.log('Submitting artwork:', artworkData);

            // Validate data
            if (!validateArtworkData(artworkData)) {
                throw new Error('Please fill in all fields correctly');
            }

            // Upload to Firebase
            const result = await window.firebaseServices.uploadArtwork(artworkData);

            if (result.success) {
                showNotification('Artwork submitted for review. Please wait for admin approval.', 'success');
                resetForm();
<<<<<<< HEAD
                // Remove loadArtworks() call since gallery is now on a different page
=======
<<<<<<< HEAD
                // Remove loadArtworks() call since gallery is now on a different page
=======
>>>>>>> 58b177bb62c207a4305dbee5132ff78e36badeda
>>>>>>> e8deb359d12db4a0ab561bc2a1639ad9f394c527
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    // Load and display artworks
    async function loadArtworks() {
        try {
            container.innerHTML = '<p>Loading artworks...</p>';
            const artworks = await window.firebaseServices.getArtworks();
            
            // Filter to show only approved artworks
            const approvedArtworks = artworks.filter(art => art.verificationStatus === 'approved');
            
            if (!approvedArtworks.length) {
                container.innerHTML = '<p>No artworks available</p>';
                return;
            }

            container.innerHTML = approvedArtworks.map(art => createArtworkCard(art)).join('');
        } catch (error) {
            console.error('Failed to load artworks:', error);
            container.innerHTML = '<p>Error loading artworks. Please try again later.</p>';
        }
    }

>>>>>>> 58b177bb62c207a4305dbee5132ff78e36badeda
>>>>>>> e8deb359d12db4a0ab561bc2a1639ad9f394c527
    // Helper Functions
    function validateArtworkData(data) {
        return (
            data.title.length > 0 &&
            data.artist.length > 0 &&
            data.price > 0 &&
            data.description.length > 0
        );
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    function createArtworkCard(artwork) {
        return `
            <div class="artwork-item" data-id="${artwork.id}">
                <button class="delete-btn" onclick="deleteArtwork('${artwork.id}')">&times;</button>
                <img src="${artwork.imageUrl || 'images/sample.png'}" alt="${artwork.title}">
                <div class="artwork-details">
                    <h3>${artwork.title}</h3>
                    <p class="artist">By ${artwork.artist}</p>
                    <p class="price">$${artwork.price.toFixed(2)}</p>
                    <p class="description">${artwork.description}</p>
                    <div class="artwork-actions">
                        <button onclick="addToCartAndNotify('${artwork.id}')" class="add-to-cart-btn">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

>>>>>>> 58b177bb62c207a4305dbee5132ff78e36badeda
>>>>>>> e8deb359d12db4a0ab561bc2a1639ad9f394c527
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function resetForm() {
        form.reset();
        preview.src = 'images/sample.png';
    }

    // Global function for adding to cart
    window.addToCartAndNotify = async (artworkId) => {
        try {
            const result = await window.firebaseServices.addToCart(artworkId);
            if (result.success) {
                alert('Added to cart successfully!');
            }
        } catch (error) {
            console.error('Add to cart failed:', error);
            alert('Failed to add to cart: ' + error.message);
        }
    };

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
    // Global function for deleting artwork
    window.deleteArtwork = async (artworkId) => {
        if (!artworkId) {
            alert('Invalid artwork ID');
            return;
        }

        try {
            if (confirm('Are you sure you want to delete this artwork?')) {
                // Show loading state
                const deleteBtn = document.querySelector(`[data-id="${artworkId}"] .delete-btn`);
                if (deleteBtn) {
                    deleteBtn.textContent = '...';
                    deleteBtn.disabled = true;
                }

                // Attempt deletion
                await window.firebaseServices.deleteArtwork(artworkId);
                
                // Remove from DOM if successful
                const element = document.querySelector(`[data-id="${artworkId}"]`);
                if (element) {
                    element.remove();
                }
                
                showNotification('Artwork deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            showNotification('Error deleting artwork. Please try again.', 'error');
            
            // Reset delete button
            const deleteBtn = document.querySelector(`[data-id="${artworkId}"] .delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = '×';
                deleteBtn.disabled = false;
            }
        }
    };

    // Initialize
    loadArtworks();
>>>>>>> 58b177bb62c207a4305dbee5132ff78e36badeda
>>>>>>> e8deb359d12db4a0ab561bc2a1639ad9f394c527
    console.log('Products page initialized');
});
