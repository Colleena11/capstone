function waitForFirebase(maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
            if (window.firebase || window.firebaseServices) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Firebase failed to initialize'));
            } else {
                attempts++;
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Wrap the initialization code in an async IIFE
(async () => {
    try {
        await waitForFirebase();
        
        const form = document.getElementById('artworkForm');
        const preview = document.getElementById('photo-pic');
        const fileInput = document.getElementById('input-file');
        const submitBtn = form.querySelector('button[type="submit"]');

        // File preview
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                const formData = new FormData();
                
                // Only add text fields to FormData
                formData.append('title', document.getElementById('artTitle').value);
                formData.append('artist', document.getElementById('artistName').value);
                formData.append('price', document.getElementById('price').value);
                formData.append('description', document.getElementById('description').value);

                // Show loading state
                submitBtn.textContent = 'Uploading...';
                submitBtn.disabled = true;

                const result = await window.firebaseServices.uploadArtwork(formData);
                
                // Show success and refresh page
                alert('Artwork information saved successfully!');
                window.location.reload();
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Upload failed: ' + error.message);
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
})();
