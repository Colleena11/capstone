export const showLoading = (element, message = 'Loading...') => {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = message;
};

export const hideLoading = (element) => {
    element.disabled = false;
    element.textContent = element.dataset.originalText;
};

export const showFeedback = (message, type = 'success') => {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback ${type}`;
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);

    setTimeout(() => {
        feedbackDiv.remove();
    }, 5000);
};

export const clearFormErrors = (form) => {
    form.querySelectorAll('.error').forEach(element => {
        element.classList.remove('error');
    });
};
