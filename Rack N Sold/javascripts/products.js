document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Get all required elements
    const form = document.getElementById('artworkForm');
    const fileInput = document.getElementById('input-file');
    const preview = document.getElementById('photo-pic');
    const submitBtn = document.querySelector('button[type="submit"]');
    const modal = document.getElementById('uploadGuideModal');
    const howToBtn = document.getElementById('howToUpload');
    const closeBtn = document.querySelector('.close');

    console.log('Elements found:', {
        form: !!form,
        fileInput: !!fileInput,
        preview: !!preview,
        submitBtn: !!submitBtn,
        modal: !!modal,
        howToBtn: !!howToBtn,
        closeBtn: !!closeBtn
    });

    let lastCompressedImage = null;
    let isUploading = false;

    const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MIN_PRICE = 100; // Minimum price in PHP

    // Modal functionality
    if (howToBtn && modal) {
        howToBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                console.log('Opening modal');
                modal.style.display = 'block';
                // Allow display:block to take effect before adding visible class
                requestAnimationFrame(() => {
                    modal.classList.add('visible');
                });
                document.body.style.overflow = 'hidden';
            } else {
                console.error('Modal element not found');
            }
        });
    } else {
        console.error('Modal elements not found:', { modal: !!modal, howToBtn: !!howToBtn });
    }

    function closeModal() {
        if (modal) {
            console.log('Closing modal');
            modal.classList.remove('visible');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300); // Match the CSS transition duration
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Show modal on first visit (after a slight delay)
    if (!localStorage.getItem('hasSeenGuide')) {
        setTimeout(() => {
            if (modal) {
                console.log('First visit detected, showing modal');
                modal.style.display = 'block';
                requestAnimationFrame(() => {
                    modal.classList.add('visible');
                });
                document.body.style.overflow = 'hidden';
                localStorage.setItem('hasSeenGuide', 'true');
            }
        }, 1000);
    }

    async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            if (!VALID_IMAGE_TYPES.includes(file.type)) {
                reject(new Error('Invalid image type. Please use JPG, PNG, GIF, or WebP.'));
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                reject(new Error('File size too large. Maximum size is 5MB.'));
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

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
                    
                    const base64String = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64String);
                };
                img.onerror = () => reject(new Error('Error loading image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    }

    function showNotification(message, type) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        notification.classList.add('slide-in');
        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function validateForm() {
        const title = document.getElementById('artTitle').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const artist = document.getElementById('artistName').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!title) {
            throw new Error('Please enter an artwork title');
        }
        if (!artist) {
            throw new Error('Please enter the artist name');
        }
        if (!description || description.length < 10) {
            throw new Error('Please enter a description (minimum 10 characters)');
        }
        if (isNaN(price) || price < MIN_PRICE) {
            throw new Error(`Price must be at least ₱${MIN_PRICE}`);
        }
        if (!lastCompressedImage) {
            throw new Error('Please select an image');
        }
    }

    // Handle file selection with preview animation
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        preview.classList.add('loading');
        preview.style.opacity = '0.5';
        
        try {
            lastCompressedImage = await compressImage(file);
            preview.style.opacity = '0';
            setTimeout(() => {
                preview.src = lastCompressedImage;
                preview.style.opacity = '1';
                showNotification('Image loaded and compressed successfully', 'success');
            }, 300);
        } catch (error) {
            console.error('Error processing image:', error);
            showNotification(error.message || 'Error processing image', 'error');
            fileInput.value = '';
            preview.src = 'images/sample.png';
        } finally {
            preview.classList.remove('loading');
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (isUploading) return;

        try {
            validateForm();
            isUploading = true;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            const formData = {
                title: document.getElementById('artTitle').value.trim(),
                artist: document.getElementById('artistName').value.trim(),
                price: parseFloat(document.getElementById('price').value),
                description: document.getElementById('description').value.trim(),
                image: lastCompressedImage,
                status: 'pending',
                uploadDate: new Date().toISOString(),
                id: 'art_' + Date.now()
            };

            // Get existing artworks or initialize empty array
            let artworks = JSON.parse(localStorage.getItem('artworks') || '[]');
            
            // Add new artwork
            artworks.push(formData);
            
            // Save to localStorage
            localStorage.setItem('artworks', JSON.stringify(artworks));

            // Show success message
            showNotification('Artwork uploaded successfully! Waiting for admin approval.', 'success');

            // Reset form
            form.reset();
            preview.src = 'images/upload-placeholder.png';
            lastCompressedImage = null;

            // Trigger gallery refresh in admin panel if it's open
            if (window.opener) {
                window.opener.postMessage({ type: 'ARTWORK_UPLOADED' }, '*');
            }

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            isUploading = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Upload Artwork';
        }
    });

    // Add input validation and formatting
    const priceInput = document.getElementById('price');
    priceInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value);
            e.target.value = value;
        }
    });

    // Prevent accidental form submission
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
});
