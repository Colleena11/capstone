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
            // Validate form data
            const artworkData = {
                title: document.getElementById('artTitle').value.trim(),
                artist: document.getElementById('artistName').value.trim(),
                price: parseFloat(document.getElementById('price').value),
                description: document.getElementById('description').value.trim(),
                createdAt: new Date().toISOString(),
                status: 'available',
                imageUrl: currentImagePreviewUrl // Save the current preview URL
            };

            // Validate data
            if (!validateArtworkData(artworkData)) {
                throw new Error('Please fill in all fields correctly');
            }

            // Upload to Firestore
            console.log('Uploading artwork:', artworkData);
            const result = await window.firebaseServices.uploadArtwork(artworkData);

            if (result.success) {
                currentImagePreviewUrl = 'images/sample.png';
                showNotification('Artwork uploaded successfully!', 'success');
                resetForm();
                // Remove loadArtworks() call since gallery is now on a different page
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Helper Functions
    function validateArtworkData(data) {
        return (
            data.title.length > 0 &&
            data.artist.length > 0 &&
            data.price > 0 &&
            data.description.length > 0
        );
    }

    function showNotification(message, type = 'info') {
        alert(message); // You can replace this with a better notification system
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

    console.log('Products page initialized');
});
