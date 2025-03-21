/**
 * DOIS ELLOS GOIÂNIA - Main JavaScript File
 * Contains all JavaScript functionality for the futuristic suit store website
 */

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavbarScroll();
    initSmoothScroll();
    initProductHover();
    initNewsletterValidation();
});

/**
 * Changes navbar background on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Implements smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Enhances product card hover effects
 */
function initProductHover() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.product-overlay').style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.product-overlay').style.opacity = '0';
        });
    });
}

/**
 * Validates newsletter form input
 */
function initNewsletterValidation() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = document.querySelector('.newsletter-form input[type="email"]');
    const subscribeButton = document.querySelector('.newsletter-form button');
    
    if (newsletterForm && emailInput && subscribeButton) {
        subscribeButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!isValidEmail(email)) {
                showFormError(emailInput, 'Por favor, insira um endereço de e-mail válido.');
                return;
            }
            
            // Here you would typically submit the form or make an API call
            // For demo purposes, we'll just show a success message
            emailInput.value = '';
            showSuccessMessage(newsletterForm, 'Obrigado por se inscrever! Em breve você receberá nossas novidades.');
        });
        
        // Reset validation on input
        emailInput.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const errorMessage = this.parentElement.querySelector('.invalid-feedback');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    }
}

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Shows form error message
 * @param {HTMLElement} inputElement - The input element with error
 * @param {string} message - Error message to display
 */
function showFormError(inputElement, message) {
    inputElement.classList.add('is-invalid');
    
    // Remove any existing error message first
    const existingError = inputElement.parentElement.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    inputElement.parentElement.appendChild(errorDiv);
}

/**
 * Shows a success message after form submission
 * @param {HTMLElement} formElement - The form element
 * @param {string} message - Success message to display
 */
function showSuccessMessage(formElement, message) {
    // Remove any existing alert first
    const existingAlert = formElement.parentElement.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create and append success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success mt-3';
    alertDiv.textContent = message;
    formElement.parentElement.appendChild(alertDiv);
    
    // Remove the alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Detects user's preferred color scheme and applies appropriate theme
 * (Feature for future implementation)
 */
function detectColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Apply dark theme styles
        document.body.classList.add('dark-theme');
    } else {
        // Apply light theme styles (default)
        document.body.classList.remove('dark-theme');
    }
}
