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

    // Modal Functionality
    const modal = document.getElementById('uploadGuideModal');
    const closeModal = document.querySelector('.close');
    const howToUploadBtn = document.querySelector('.how-to-btn');

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    howToUploadBtn.onclick = () => {
        modal.style.display = 'block';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Image Preview Enhancement
    const inputFile = document.getElementById('input-file');
    const photoPic = document.getElementById('photo-pic');

    inputFile.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPic.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Form Validation
    const artworkForm = document.getElementById('artworkForm');
    const titleInput = document.getElementById('artTitle');
    const artistInput = document.getElementById('artistName');
    const priceInput = document.getElementById('price');
    const descriptionInput = document.getElementById('description');

    function validateForm() {
        let isValid = true;

        if (titleInput.value.trim() === '') {
            isValid = false;
            titleInput.style.borderColor = 'red';
        } else {
            titleInput.style.borderColor = '#ddd';
        }

        if (artistInput.value.trim() === '') {
            isValid = false;
            artistInput.style.borderColor = 'red';
        } else {
            artistInput.style.borderColor = '#ddd';
        }

        if (priceInput.value <= 0) {
            isValid = false;
            priceInput.style.borderColor = 'red';
        } else {
            priceInput.style.borderColor = '#ddd';
        }

        if (descriptionInput.value.trim() === '') {
            isValid = false;
            descriptionInput.style.borderColor = 'red';
        } else {
            descriptionInput.style.borderColor = '#ddd';
        }

        if (!inputFile.files.length) {
            isValid = false;
            inputFile.parentElement.style.borderColor = 'red';
        } else {
            inputFile.parentElement.style.borderColor = 'transparent';
        }

        return isValid;
    }

    artworkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            // Proceed with form submission logic
            alert('Artwork submitted successfully!');
            // You can add your actual submission logic here
        }
    });

    // Ensure modal is clickable
    const modalContent = modal.querySelector('.modal-content');

    // Prevent modal background from closing when clicking inside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Prevent clicks inside modal from propagating
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
