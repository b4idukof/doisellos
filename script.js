/**
 * Product Gallery System for Doisellos Camisetaria
 * Enhanced image carousel functionality with touch support
 */

class ProductGallery {
    constructor() {
        this.galleries = [];
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        // Product page mapping
        this.productPageMap = {
            'Terno Executivo': 'produto-terno-executivo.html',
            'Terno Clássico': 'produto-terno-classico.html',
            'Terno Slim Fit Preto': 'produto-terno-slim-fit.html',
            'Terno black Elegance': 'produto-terno-black-elegance.html',
            'Camisetas Sociais': 'produto-camiseta-social.html',
            'Camiseta social Premiun': 'produto-camiseta-premium.html',
            'Camiseta Social Azul': 'produto-camiseta-social.html',
            'Camiseta Social Branca': 'produto-camiseta-social.html',
            'Camiseta Social Listrada': 'produto-camiseta-social.html',
            'Calça Social Preta Premium': 'produto-calcas-social.html',
            'Calça Social Cinza': 'produto-calcas-social.html',
            'Calça Social Sarja': 'produto-calcas-social.html'
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGalleries());
        } else {
            this.setupGalleries();
        }
    }

    setupGalleries() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const gallery = this.createGalleryInstance(card, index);
            this.galleries.push(gallery);
        });

        // Add keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Setup buy button functionality
        this.setupBuyButtons();
    }

    createGalleryInstance(card, cardIndex) {
        const container = card.querySelector('.gallery-container');
        const images = card.querySelectorAll('.gallery-image');
        const dots = card.querySelectorAll('.dot');
        const prevBtn = card.querySelector('.gallery-nav.prev');
        const nextBtn = card.querySelector('.gallery-nav.next');

        const gallery = {
            card,
            container,
            images: Array.from(images),
            dots: Array.from(dots),
            prevBtn,
            nextBtn,
            currentIndex: 0,
            totalImages: images.length,
            isAutoPlaying: false,
            autoPlayInterval: null,
            cardIndex
        };

        // Setup event listeners for this gallery
        this.setupGalleryEvents(gallery);
        
        // Setup lazy loading
        this.setupLazyLoading(gallery);

        return gallery;
    }

    setupGalleryEvents(gallery) {
        const { prevBtn, nextBtn, dots, card, container } = gallery;

        // Navigation button events
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.previousImage(gallery);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.nextImage(gallery);
            });
        }

        // Dot navigation events
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToImage(gallery, index);
            });
        });

        // Touch events for mobile swipe
        const galleryImages = container.querySelector('.gallery-images');
        
        galleryImages.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryImages.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(gallery);
        }, { passive: true });

        // Desktop mouse drag scrolling
        let isMouseDown = false;
        let startX;
        let scrollLeft;

        galleryImages.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            galleryImages.style.cursor = 'grabbing';
            startX = e.pageX - galleryImages.offsetLeft;
            scrollLeft = galleryImages.scrollLeft;
            e.preventDefault();
        });

        galleryImages.addEventListener('mouseleave', () => {
            isMouseDown = false;
            galleryImages.style.cursor = 'grab';
        });

        galleryImages.addEventListener('mouseup', () => {
            isMouseDown = false;
            galleryImages.style.cursor = 'grab';
        });

        galleryImages.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - galleryImages.offsetLeft;
            const walk = (x - startX) * 2;
            galleryImages.scrollLeft = scrollLeft - walk;
        });

        // Add scroll event listener to update dots when user scrolls manually
        galleryImages.addEventListener('scroll', () => {
            this.updateDotsOnScroll(gallery);
        }, { passive: true });

        // Mouse events for desktop
        container.addEventListener('mouseenter', () => {
            this.startAutoPlay(gallery);
        });

        container.addEventListener('mouseleave', () => {
            this.stopAutoPlay(gallery);
        });

        // Prevent context menu on touch devices
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupLazyLoading(gallery) {
        const { images } = gallery;
        
        // Create intersection observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        images.forEach(img => {
            // If image has a data-src attribute, observe it for lazy loading
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn(`Failed to load image: ${img.src}`);
                img.style.background = 'var(--light-gray)';
            });

            // Add load event for smooth transitions
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        });
    }

    setupBuyButtons() {
        const buyButtons = document.querySelectorAll('.buy-btn, .buy-btn-bottom');
        
        buyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleBuyClick(button);
            });
        });
    }

    handleBuyClick(button) {
        // Get product information
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent.trim();
        const productPrice = productCard.querySelector('.price').textContent;
        
        // Log product information for debugging
        console.log(`Buy button clicked for: ${productName} - ${productPrice}`);
        
        // Check if we have a specific page for this product
        const productPage = this.productPageMap[productName];
        
        if (productPage) {
            // Redirect to the specific product page
            window.location.href = productPage;
        } else {
            // Fallback: try to match similar product names
            const fallbackPage = this.findFallbackPage(productName);
            if (fallbackPage) {
                window.location.href = fallbackPage;
            } else {
                // If no specific page found, create WhatsApp message as fallback
                const message = `Olá! Tenho interesse no produto: ${productName} - ${productPrice}`;
                const whatsappUrl = `https://wa.me/5562981906158?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                console.log(`No specific page found for: ${productName}, redirected to WhatsApp`);
            }
        }
    }

    findFallbackPage(productName) {
        const name = productName.toLowerCase();
        
        // Check for product categories
        if (name.includes('terno')) {
            return 'produto-terno-executivo.html';
        } else if (name.includes('camiseta') || name.includes('camisa')) {
            return 'produto-camiseta-social.html';
        } else if (name.includes('calça') || name.includes('calca')) {
            return 'produto-calcas-social.html';
        }
        
        return null;
    }

    nextImage(gallery) {
        const nextIndex = (gallery.currentIndex + 1) % gallery.totalImages;
        this.goToImage(gallery, nextIndex);
    }

    previousImage(gallery) {
        const prevIndex = (gallery.currentIndex - 1 + gallery.totalImages) % gallery.totalImages;
        this.goToImage(gallery, prevIndex);
    }

    goToImage(gallery, index) {
        if (index === gallery.currentIndex || index < 0 || index >= gallery.totalImages) {
            return;
        }

        const { images, dots, container } = gallery;
        const galleryImages = container.querySelector('.gallery-images');

        // Scroll to the target image
        const scrollPosition = index * galleryImages.clientWidth;
        galleryImages.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });

        // Update active dot
        if (dots[gallery.currentIndex]) {
            dots[gallery.currentIndex].classList.remove('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        gallery.currentIndex = index;

        // Trigger image load if using lazy loading
        const newImage = images[index];
        if (newImage.dataset.src && !newImage.src) {
            newImage.src = newImage.dataset.src;
            newImage.removeAttribute('data-src');
        }
    }

    updateDotsOnScroll(gallery) {
        const { container, dots, totalImages } = gallery;
        const galleryImages = container.querySelector('.gallery-images');
        const scrollLeft = galleryImages.scrollLeft;
        const imageWidth = galleryImages.clientWidth;
        const currentIndex = Math.round(scrollLeft / imageWidth);
        
        if (currentIndex !== gallery.currentIndex && currentIndex >= 0 && currentIndex < totalImages) {
            // Update active dot
            if (dots[gallery.currentIndex]) {
                dots[gallery.currentIndex].classList.remove('active');
            }
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
            
            gallery.currentIndex = currentIndex;
        }
    }

    handleSwipe(gallery) {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) < this.minSwipeDistance) {
            return; // Not a significant swipe
        }

        if (swipeDistance > 0) {
            // Swipe right - go to previous image
            this.previousImage(gallery);
        } else {
            // Swipe left - go to next image
            this.nextImage(gallery);
        }
    }

    startAutoPlay(gallery) {
        if (gallery.totalImages <= 1 || gallery.isAutoPlaying) {
            return;
        }

        gallery.isAutoPlaying = true;
        gallery.autoPlayInterval = setInterval(() => {
            this.nextImage(gallery);
        }, 3000); // Change image every 3 seconds
    }

    stopAutoPlay(gallery) {
        if (gallery.autoPlayInterval) {
            clearInterval(gallery.autoPlayInterval);
            gallery.autoPlayInterval = null;
            gallery.isAutoPlaying = false;
        }
    }

    handleKeyboardNavigation(e) {
        // Only handle keyboard navigation if focus is on a gallery element
        const focusedElement = document.activeElement;
        const galleryElement = focusedElement.closest('.product-card');
        
        if (!galleryElement) return;

        const gallery = this.galleries.find(g => g.card === galleryElement);
        if (!gallery) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousImage(gallery);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextImage(gallery);
                break;
            case 'Home':
                e.preventDefault();
                this.goToImage(gallery, 0);
                break;
            case 'End':
                e.preventDefault();
                this.goToImage(gallery, gallery.totalImages - 1);
                break;
        }
    }

    // Public method to manually control galleries
    getGallery(cardIndex) {
        return this.galleries[cardIndex];
    }

    // Public method to refresh galleries (useful for dynamic content)
    refresh() {
        this.galleries.forEach(gallery => {
            this.stopAutoPlay(gallery);
        });
        this.galleries = [];
        this.setupGalleries();
    }
}

// Initialize the gallery system
const productGallery = new ProductGallery();

// Additional utility functions
function preloadImages() {
    const images = document.querySelectorAll('.gallery-image');
    images.forEach(img => {
        if (img.src) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Preload images when page is idle
if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadImages);
} else {
    setTimeout(preloadImages, 2000);
}

// FAQ Functionality
class FAQManager {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFAQ());
        } else {
            this.setupFAQ();
        }
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', () => {
                    const isOpen = item.classList.contains('open');
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('open');
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('open', !isOpen);
                });
            }
        });
    }
}

// Initialize FAQ system
const faqManager = new FAQManager();

// Contact form functionality
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        const contactForm = document.querySelector('#contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Create WhatsApp message
        const whatsappMessage = `Olá! Meu nome é ${name} (${email}). ${message}`;
        const whatsappUrl = `https://wa.me/5562981906158?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Reset form
        e.target.reset();
        
        // Show success message
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <p>Mensagem enviada! Você será redirecionado para o WhatsApp.</p>
        `;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #25D366;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize contact form
const contactForm = new ContactForm();