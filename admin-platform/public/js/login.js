document.addEventListener('DOMContentLoaded', () => {
    setupFormToggles();
    setupFormHandlers();
});

function setupFormToggles() {
    const loginForm = document.getElementById('adminLoginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');

    document.getElementById('showRegister').addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        formTitle.textContent = 'Admin Registration';
        clearErrors();
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
        formTitle.textContent = 'Admin Login';
        clearErrors();
    });
}

function setupFormHandlers() {
    // Login form handler
    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorMessage = document.getElementById('loginError');

        try {
            showLoading(true);
            console.log('Attempting login with:', email);
            
            if (email !== 'admin@gmail.com') {
                throw new Error('Access denied. Only admin@gmail.com can login.');
            }

            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login successful');
            
            // Let auth.js handle the redirect
            await checkAuth();

        } catch (error) {
            console.error('Login error:', error);
            showError(errorMessage, error.message);
            showLoading(false);
        }
    });

    // Registration form handler
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const errorMessage = document.getElementById('registerError');

        try {
            showLoading(true);
            
            // Validate password match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            await firebase.auth().createUserWithEmailAndPassword(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            showError(errorMessage, error.message);
        } finally {
            showLoading(false);
        }
    });
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function clearErrors() {
    const errors = document.getElementsByClassName('error-message');
    for (let error of errors) {
        error.style.display = 'none';
        error.textContent = '';
    }
}

function showLoading(isLoading) {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Please wait...' : button.textContent.replace('Please wait...', 'Login');
    });
}
