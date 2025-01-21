document.addEventListener('DOMContentLoaded', () => {
    // Make sure Firebase is initialized
    if (!window.firebase || !window.firebaseServices) {
        console.error('Firebase not initialized');
        return;
    }

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
        
        try {
            const formData = new FormData();
            const fileInput = document.getElementById('input-file');
            
            // Add file and form fields to FormData
            formData.append('image', fileInput.files[0]);
            formData.append('title', document.getElementById('artTitle').value);
            formData.append('artist', document.getElementById('artistName').value);
            formData.append('price', document.getElementById('price').value);
            formData.append('description', document.getElementById('description').value);

            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Uploading...';
            submitBtn.disabled = true;

            await window.firebaseServices.uploadArtwork(formData);
            
            // Show success and redirect
            alert('Artwork uploaded successfully! Redirecting to admin page...');
            window.location.href = '../admin-platform/public/admin.html';
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
            
            // Reset button state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
