document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Scroll Reveal animations
    initScrollReveal();

    // 2. Initialize Carousels
    initCarousel('why-carousel');
    initCarousel('testimonials-carousel');
    initCarousel('office-carousel');

    // 3. Initialize Lightbox Modal
    initLightbox();

    // 4. Initialize Webhook Form submission
    initFormHandler();
});

/* --- Scroll Reveal --- */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* --- Carousel Logic --- */
function initCarousel(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    const container = wrapper.querySelector('.overflow-hidden');
    const track = wrapper.querySelector('.carousel-track');
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    if (!container || !track) return;

    // Handle Prev Click
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const scrollAmount = track.firstElementChild ? track.firstElementChild.clientWidth : container.clientWidth;
            container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
    }

    // Handle Next Click
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const scrollAmount = track.firstElementChild ? track.firstElementChild.clientWidth : container.clientWidth;
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
}

/* --- Lightbox Modal --- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close-btn');
    const prevBtn = lightbox.querySelector('.lightbox-prev-btn');
    const nextBtn = lightbox.querySelector('.lightbox-next-btn');

    let currentGalleryName = null;
    let galleryItems = [];
    let currentIndex = -1;

    // Helper to update the image in the lightbox
    const updateLightboxImage = () => {
        if (currentIndex >= 0 && currentIndex < galleryItems.length) {
            const item = galleryItems[currentIndex];
            const src = item.getAttribute('src') || item.dataset.src;
            if (src) {
                lightboxImg.setAttribute('src', src);
            }
        }
    };

    // Helper to navigate
    const navigate = (direction) => {
        if (galleryItems.length <= 1) return;
        currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
        updateLightboxImage();
    };

    // Attach click events to trigger elements
    const triggerElements = document.querySelectorAll('[data-lightbox-trigger]');
    triggerElements.forEach(el => {
        el.addEventListener('click', () => {
            const src = el.getAttribute('src') || el.dataset.src;
            if (src) {
                // Get the gallery group name
                currentGalleryName = el.getAttribute('data-gallery');
                
                // Get all items in this gallery group, or just this single item if not grouped
                if (currentGalleryName) {
                    galleryItems = Array.from(document.querySelectorAll(`[data-lightbox-trigger][data-gallery="${currentGalleryName}"]`));
                } else {
                    galleryItems = [el];
                }
                
                currentIndex = galleryItems.indexOf(el);

                lightboxImg.setAttribute('src', src);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Prev Button Click
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(-1);
        });
    }

    // Next Button Click
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(1);
        });
    }

    // Prevent closing when clicking the image itself
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close on click background or close button
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === closeBtn || closeBtn.contains(e.target)) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!lightbox.classList.contains('active')) {
                    lightboxImg.setAttribute('src', '');
                    currentGalleryName = null;
                    galleryItems = [];
                    currentIndex = -1;
                }
            }, 300);
        }
    });

    // Keyboard navigation (Escape to close, Arrows to navigate)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!lightbox.classList.contains('active')) {
                    lightboxImg.setAttribute('src', '');
                    currentGalleryName = null;
                    galleryItems = [];
                    currentIndex = -1;
                }
            }, 300);
        } else if (e.key === 'ArrowLeft') {
            navigate(-1);
        } else if (e.key === 'ArrowRight') {
            navigate(1);
        }
    });
}

/* --- Webhook Form Submission Handler --- */
function initFormHandler() {
    const form = document.getElementById('assessment-form');
    if (!form) return;

    const submitBtn = form.querySelector('.form-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear existing errors
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(el => el.style.display = 'none');

        // Form Fields
        const fullNameEl = document.getElementById('fullName');
        const emailEl = document.getElementById('email');
        const phoneEl = document.getElementById('phone');
        const concernEl = document.getElementById('biggestConcern');
        const changesEl = document.getElementById('specificChanges');
        const treatmentsEl = document.getElementById('pastTreatments');

        let hasError = false;

        // Validation helper
        const showError = (element, message) => {
            const container = element.closest('.form-group') || element.parentElement;
            if (container) {
                let errEl = container.querySelector('.form-error');
                if (errEl) {
                    errEl.textContent = message;
                    errEl.style.display = 'block';
                }
            }
            hasError = true;
        };

        // Name Validation
        if (!fullNameEl.value || fullNameEl.value.trim().length < 2) {
            showError(fullNameEl, "Name must be at least 2 characters.");
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailEl.value || !emailRegex.test(emailEl.value.trim())) {
            showError(emailEl, "Please enter a valid email address.");
        }

        // Phone Validation (must be at least 10 numbers)
        const phoneDigits = phoneEl.value.replace(/\D/g, '');
        if (!phoneEl.value || phoneDigits.length < 10) {
            showError(phoneEl, "Please enter a valid phone number (at least 10 digits).");
        }

        // Biggest Concern Validation
        if (!concernEl.value || concernEl.value.trim().length < 2) {
            showError(concernEl, "This field is required.");
        }

        // Specific Changes Validation
        if (!changesEl.value || changesEl.value.trim().length < 2) {
            showError(changesEl, "This field is required.");
        }

        // Past Treatments Validation
        if (!treatmentsEl.value || treatmentsEl.value.trim().length < 2) {
            showError(treatmentsEl, "This field is required.");
        }

        if (hasError) return;

        // Disable button to prevent double submit
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
        }

        // Payload structure
        const fullNameVal = fullNameEl.value.trim();
        const first_name = fullNameVal.split(" ")[0];
        const last_name = fullNameVal.split(" ").slice(1).join(" ") || undefined;

        const webhookPayload = {
            fullName: fullNameVal,
            first_name: first_name,
            last_name: last_name,
            email: emailEl.value.trim(),
            phone: phoneEl.value.trim(),
            biggestConcern: concernEl.value.trim(),
            specificChanges: changesEl.value.trim(),
            pastTreatments: treatmentsEl.value.trim(),
            submittedAt: new Date().toISOString(),
            url: window.location.href,
            device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop"
        };

        const webhookUrl = "https://services.leadconnectorhq.com/hooks/uhpMfULsXkINzahojYbf/webhook-trigger/0aa4786b-1720-4be3-b7b2-6a5f605508df";

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(webhookPayload)
            });
            console.log("Form successfully submitted to webhook:", response.status);
        } catch (error) {
            console.error("Webhook submission failed, redirecting anyway to maintain flow:", error);
        }

        // Always redirect to book.html after submission
        window.location.href = "book.html";
    });
}
