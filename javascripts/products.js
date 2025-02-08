document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('artworkForm');
    const fileInput = document.getElementById('input-file');
    const preview = document.getElementById('photo-pic');
    let lastCompressedImage = null;

    async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 and resolve
                    const base64String = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64String);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Handle file selection
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            fileInput.value = '';
            preview.src = 'images/sample.png';
            return;
        }

        try {
            lastCompressedImage = await compressImage(file);
            preview.src = lastCompressedImage;
            showNotification('Image loaded and compressed successfully', 'success');
        } catch (error) {
            console.error('Error processing image:', error);
            showNotification('Error processing image', 'error');
            fileInput.value = '';
            preview.src = 'images/sample.png';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!lastCompressedImage) {
            showNotification('Please select an image', 'error');
            return;
        }

        const title = document.getElementById('artTitle').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const artist = document.getElementById('artistName').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!title || !artist || !description || isNaN(price) || price <= 0) {
            showNotification('Please fill in all fields correctly', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    price,
                    artist,
                    description,
                    image: lastCompressedImage
                })
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            showNotification('Artwork uploaded successfully', 'success');
            form.reset();
            preview.src = 'images/sample.png';
            lastCompressedImage = null;
        } catch (error) {
            console.error('Error uploading artwork:', error);
            showNotification('Failed to upload artwork', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
