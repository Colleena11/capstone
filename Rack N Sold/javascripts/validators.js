export const validateArtwork = {
    title: (value) => {
        if (!value || value.trim().length < 3) {
            throw new Error('Title must be at least 3 characters long');
        }
        if (value.trim().length > 100) {
            throw new Error('Title must not exceed 100 characters');
        }
        return value.trim();
    },

    artist: (value) => {
        if (!value || value.trim().length < 2) {
            throw new Error('Artist name must be at least 2 characters long');
        }
        if (value.trim().length > 50) {
            throw new Error('Artist name must not exceed 50 characters');
        }
        return value.trim();
    },

    price: (value) => {
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
            throw new Error('Price must be a positive number');
        }
        if (price > 1000000) {
            throw new Error('Price must not exceed 1,000,000');
        }
        return price;
    },

    description: (value) => {
        if (!value || value.trim().length < 10) {
            throw new Error('Description must be at least 10 characters long');
        }
        if (value.trim().length > 500) {
            throw new Error('Description must not exceed 500 characters');
        }
        return value.trim();
    },

    image: (file) => {
        if (!file) {
            throw new Error('Please select an image');
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Please upload a valid image file (JPEG, PNG)');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size must not exceed 5MB');
        }
        return file;
    }
};
