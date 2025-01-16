export class ArtworkError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ArtworkError';
        this.field = field;
    }
}

export const handleError = (error, feedbackElement = null) => {
    console.error('Error:', error);

    let message = 'An unexpected error occurred. Please try again.';
    
    if (error instanceof ArtworkError) {
        message = error.message;
        if (error.field) {
            const inputElement = document.getElementById(error.field);
            if (inputElement) {
                inputElement.classList.add('error');
                inputElement.focus();
            }
        }
    } else if (error.code) {
        // Handle Firebase errors
        switch (error.code) {
            case 'storage/unauthorized':
                message = 'Permission denied. Please check your credentials.';
                break;
            case 'storage/canceled':
                message = 'Upload canceled. Please try again.';
                break;
            default:
                message = error.message;
        }
    }

    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.classList.add('error');
        setTimeout(() => {
            feedbackElement.textContent = '';
            feedbackElement.classList.remove('error');
        }, 5000);
    } else {
        alert(message);
    }
};
