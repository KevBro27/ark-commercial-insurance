/*
 * Ark Insurance - Main JavaScript
 * Interactive functionality for professional insurance website
 */

// ========================================
// GLOBAL VARIABLES & CONFIGURATION
// ========================================
const ARK_CONFIG = {
    // Quote calculation constants
    LIFE_INSURANCE_RATES: {
        base_rates: {
            male: { 20: 15, 30: 18, 40: 25, 50: 45, 60: 85 },
            female: { 20: 12, 30: 15, 40: 22, 50: 38, 60: 72 }
        },
        smoker_multiplier: 2.5,
        health_multipliers: {
            excellent: 1.0,
            good: 1.15,
            fair: 1.35,
            poor: 1.75
        },
        coverage_multipliers: {
            100000: 1.0,
            250000: 2.2,
            500000: 4.1,
            750000: 5.8,
            1000000: 7.5
        }
    },
    
    // Form validation settings
    VALIDATION: {
        email_regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone_regex: /^[\+]?[(]?[\d\s\-\(\)]{10,}$/,
        zip_regex: /^\d{5}(-\d{4})?$/
    },
    
    // Animation settings
    ANIMATION: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
class ArkUtils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    static formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// ========================================
// NAVIGATION CONTROLLER
// ========================================
class NavigationController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    }
    
    setupMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const icon = mobileMenuButton.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupActiveNavigation() {
        window.addEventListener('scroll', ArkUtils.debounce(() => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('text-ark-brown-600');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('text-ark-brown-600');
                }
            });
        }, 100));
    }
}

// ========================================
// FORM VALIDATION CONTROLLER
// ========================================
class FormValidator {
    static validateField(field, value) {
        const fieldType = field.type || field.name;
        const errors = [];
        
        // Required field check
        if (field.required && (!value || value.trim() === '')) {
            errors.push('This field is required');
        }
        
        if (value && value.trim() !== '') {
            switch (fieldType) {
                case 'email':
                    if (!ARK_CONFIG.VALIDATION.email_regex.test(value)) {
                        errors.push('Please enter a valid email address');
                    }
                    break;
                    
                case 'tel':
                case 'phone':
                    if (!ARK_CONFIG.VALIDATION.phone_regex.test(value)) {
                        errors.push('Please enter a valid phone number');
                    }
                    break;
                    
                case 'zipCode':
                    if (!ARK_CONFIG.VALIDATION.zip_regex.test(value)) {
                        errors.push('Please enter a valid ZIP code');
                    }
                    break;
                    
                case 'dateOfBirth':
                    const age = ArkUtils.calculateAge(value);
                    if (age < 18) {
                        errors.push('Must be 18 years or older');
                    } else if (age > 85) {
                        errors.push('Please contact us directly for coverage options');
                    }
                    break;
                    
                case 'firstName':
                case 'lastName':
                    if (value.length < 2) {
                        errors.push('Name must be at least 2 characters');
                    }
                    break;
            }
        }
        
        return errors;
    }
    
    static showFieldError(fieldElement, errors) {
        const container = fieldElement.closest('.form-field') || fieldElement.parentElement;
        container.classList.remove('success', 'error');
        
        // Remove existing error messages
        const existingError = container.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        if (errors.length > 0) {
            container.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errors[0]}`;
            
            container.appendChild(errorDiv);
            return false;
        } else {
            container.classList.add('success');
            return true;
        }
    }
    
    static validateForm(formElement) {
        const fields = formElement.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            const errors = this.validateField(field, field.value);
            if (!this.showFieldError(field, errors)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
}

// ========================================
// QUOTE CALCULATOR CONTROLLER
// ========================================
class QuoteCalculator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }
    
    init() {
        this.setupStepNavigation();
        this.setupFormValidation();
        this.setupQuoteCalculation();
    }
    
    setupStepNavigation() {
        // Next step buttons
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', () => {
                if (this.validateCurrentStep()) {
                    this.nextStep();
                }
            });
        });
        
        // Previous step buttons
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', () => {
                this.prevStep();
            });
        });
        
        // Restart quote button
        document.querySelector('.restart-quote')?.addEventListener('click', () => {
            this.restartQuote();
        });
    }
    
    setupFormValidation() {
        const calculator = document.querySelector('.quote-calculator');
        if (!calculator) return;
        
        const inputs = calculator.querySelectorAll('input, select');
        inputs.forEach(input => {
            // Wrap inputs in form-field containers if not already
            if (!input.closest('.form-field')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'form-field';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
            }
            
            // Real-time validation
            input.addEventListener('blur', () => {
                const errors = FormValidator.validateField(input, input.value);
                FormValidator.showFieldError(input, errors);
            });
            
            // Store form data
            input.addEventListener('change', () => {
                this.formData[input.name] = input.value;
            });
        });
    }
    
    setupQuoteCalculation() {
        // Calculate quote when moving to step 3
        document.querySelector('.quote-calculator')?.addEventListener('stepChange', (e) => {
            if (e.detail.step === 3) {
                this.calculateQuote();
            }
        });
    }
    
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.quote-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return true;
        
        return FormValidator.validateForm(currentStepElement);
    }
    
    nextStep() {
        if (this.currentStep >= this.totalSteps) return;
        
        // Hide current step
        document.querySelector(`.quote-step[data-step="${this.currentStep}"]`).style.display = 'none';
        
        // Update step
        this.currentStep++;
        
        // Show next step
        const nextStepElement = document.querySelector(`.quote-step[data-step="${this.currentStep}"]`);
        nextStepElement.style.display = 'block';
        
        // Update progress bar
        this.updateProgress();
        
        // Update step labels
        this.updateStepLabels();
        
        // Dispatch event
        document.querySelector('.quote-calculator').dispatchEvent(
            new CustomEvent('stepChange', { detail: { step: this.currentStep } })
        );
    }
    
    prevStep() {
        if (this.currentStep <= 1) return;
        
        // Hide current step
        document.querySelector(`.quote-step[data-step="${this.currentStep}"]`).style.display = 'none';
        
        // Update step
        this.currentStep--;
        
        // Show previous step
        document.querySelector(`.quote-step[data-step="${this.currentStep}"]`).style.display = 'block';
        
        // Update progress bar
        this.updateProgress();
        
        // Update step labels
        this.updateStepLabels();
    }
    
    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    updateStepLabels() {
        document.querySelectorAll('.step-label').forEach((label, index) => {
            const stepNumber = index + 1;
            label.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                label.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                label.classList.add('active');
            }
        });
    }
    
    calculateQuote() {
        const { dateOfBirth, gender, smoker, health, coverageAmount, insuranceType } = this.formData;
        
        if (!dateOfBirth || !gender || !coverageAmount) {
            ArkUtils.showNotification('Missing required information for quote calculation', 'error');
            return;
        }
        
        const age = ArkUtils.calculateAge(dateOfBirth);
        const ageGroup = Math.floor(age / 10) * 10; // Round down to nearest decade
        const rates = ARK_CONFIG.LIFE_INSURANCE_RATES;
        
        // Get base rate
        let baseRate = rates.base_rates[gender][ageGroup] || rates.base_rates[gender][60];
        
        // Apply smoker multiplier
        if (smoker === 'yes') {
            baseRate *= rates.smoker_multiplier;
        }
        
        // Apply health multiplier
        const healthMultiplier = rates.health_multipliers[health] || 1.15;
        baseRate *= healthMultiplier;
        
        // Apply coverage multiplier
        const coverageMultiplier = rates.coverage_multipliers[coverageAmount] || 1.0;
        const monthlyPremium = baseRate * coverageMultiplier;
        
        // Update quote display
        this.displayQuote({
            monthlyPremium,
            annualPremium: monthlyPremium * 12,
            coverageAmount: parseInt(coverageAmount),
            insuranceType,
            age
        });
    }
    
    displayQuote(quote) {
        // Update premium displays
        document.querySelector('.estimated-premium').textContent = `${ArkUtils.formatCurrency(quote.monthlyPremium)}/month`;
        document.querySelector('.annual-premium').textContent = ArkUtils.formatCurrency(quote.annualPremium);
        document.querySelector('.coverage-amount-result').textContent = ArkUtils.formatCurrency(quote.coverageAmount);
        
        // Update insurance type
        const typeDisplay = quote.insuranceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.querySelector('.coverage-type-result').textContent = typeDisplay;
        
        // Animate quote results
        const results = document.querySelector('.quote-results');
        if (results) {
            results.classList.add('fade-in');
        }
    }
    
    restartQuote() {
        this.currentStep = 1;
        this.formData = {};
        
        // Hide all steps except first
        document.querySelectorAll('.quote-step').forEach((step, index) => {
            step.style.display = index === 0 ? 'block' : 'none';
        });
        
        // Reset form
        document.querySelector('.quote-calculator').reset?.();
        
        // Reset progress
        this.updateProgress();
        this.updateStepLabels();
        
        // Clear validation states
        document.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('success', 'error');
            const errorMsg = field.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    }
}

// ========================================
// CONTACT FORM CONTROLLER
// ========================================
class ContactFormController {
    constructor() {
        this.init();
    }
    
    init() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            this.setupFormSubmission(contactForm);
            this.setupFieldValidation(contactForm);
        }
    }
    
    setupFormSubmission(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!FormValidator.validateForm(form)) {
                ArkUtils.showNotification('Please correct the errors below', 'error');
                return;
            }
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            try {
                // Show loading state
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
                submitButton.disabled = true;
                
                // Simulate form submission (replace with actual endpoint)
                await this.submitForm(form);
                
                ArkUtils.showNotification('Thank you! Your message has been sent. We\'ll contact you within 2 hours.', 'success');
                form.reset();
                
                // Clear validation states
                form.querySelectorAll('.form-field').forEach(field => {
                    field.classList.remove('success', 'error');
                });
                
            } catch (error) {
                ArkUtils.showNotification('Sorry, there was an error sending your message. Please try again or call us directly.', 'error');
            } finally {
                // Restore button
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        });
    }
    
    setupFieldValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Wrap in form-field if needed
            if (!input.closest('.form-field')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'form-field';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
            }
            
            input.addEventListener('blur', () => {
                const errors = FormValidator.validateField(input, input.value);
                FormValidator.showFieldError(input, errors);
            });
        });
    }
    
    async submitForm(form) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }
}

// ========================================
// INTERACTIVE ELEMENTS CONTROLLER
// ========================================
class InteractiveController {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupCTAButtons();
        this.setupChatWidget();
        this.setupPhoneLinks();
        this.setupAnimationTriggers();
    }
    
    setupCTAButtons() {
        // Get Quote buttons
        document.querySelectorAll('.get-quote-btn, [data-action="get-quote"]').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('#quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        
        // Speak with Agent buttons
        document.querySelectorAll('.speak-agent-btn, [data-action="speak-agent"]').forEach(button => {
            button.addEventListener('click', () => {
                window.location.href = 'tel:+1-555-275-4678'; // ARK-INSURE
            });
        });
        
        // Schedule Call buttons
        document.querySelectorAll('.schedule-call, [data-action="schedule-call"]').forEach(button => {
            button.addEventListener('click', () => {
                ArkUtils.showNotification('Scheduling system coming soon! Please call us directly at (555) ARK-INSURE.', 'info');
            });
        });
        
        // Email Quote buttons
        document.querySelectorAll('.email-quote, [data-action="email-quote"]').forEach(button => {
            button.addEventListener('click', () => {
                const subject = encodeURIComponent('Insurance Quote Request - Ark Insurance');
                const body = encodeURIComponent('Hi Kevin,\n\nI\'d like to receive my insurance quote via email.\n\nThank you!');
                window.location.href = `mailto:kevin@arkinsurance.com?subject=${subject}&body=${body}`;
            });
        });
    }
    
    setupChatWidget() {
        const chatWidget = document.querySelector('.chat-widget');
        if (chatWidget) {
            chatWidget.addEventListener('click', () => {
                ArkUtils.showNotification('Live chat coming soon! Please call (555) ARK-INSURE or email kevin@arkinsurance.com', 'info');
            });
        }
    }
    
    setupPhoneLinks() {
        // Make phone numbers clickable
        document.querySelectorAll('[href="tel:+1-555-ARK-INSURE"]').forEach(link => {
            link.href = 'tel:+1-555-275-4678';
        });
    }
    
    setupAnimationTriggers() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        document.querySelectorAll('.insurance-card, .testimonial-card, .trust-badge').forEach(el => {
            observer.observe(el);
        });
    }
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeScrolling();
    }
    
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    preloadCriticalResources() {
        // Preload critical fonts
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
        ];
        
        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = 'style';
            link.onload = function() { this.rel = 'stylesheet'; };
            document.head.appendChild(link);
        });
    }
    
    optimizeScrolling() {
        // Passive event listeners for better scroll performance
        let ticking = false;
        
        function updateScrollPosition() {
            // Scroll-based updates here
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
}

// ========================================
// ANALYTICS & TRACKING
// ========================================
class AnalyticsController {
    constructor() {
        this.init();
    }
    
    init() {
        this.trackUserInteractions();
        this.trackFormProgress();
        this.trackQuoteCalculations();
    }
    
    trackUserInteractions() {
        // Track CTA clicks
        document.querySelectorAll('button, .btn, [data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action || button.textContent.trim();
                this.trackEvent('user_interaction', 'button_click', action);
            });
        });
        
        // Track phone calls
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('user_interaction', 'phone_call', 'initiated');
            });
        });
    }
    
    trackFormProgress() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                this.trackEvent('form_interaction', 'form_submit', form.className);
            });
        });
    }
    
    trackQuoteCalculations() {
        document.addEventListener('stepChange', (e) => {
            this.trackEvent('quote_calculator', 'step_change', e.detail.step);
        });
    }
    
    trackEvent(category, action, label) {
        // Google Analytics 4 tracking (replace with actual implementation)
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Console log for development
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
}

// ========================================
// CONVERSION DOMINANCE FEATURES
// ========================================
class ConversionDominanceController {
    constructor() {
        this.exitIntentTriggered = false;
        this.init();
    }
    
    init() {
        this.setupExitIntent();
        this.setupLiveCounters();
        this.setupCountdownTimer();
        this.setupStickyElements();
        this.setupLiveTicker();
    }
    
    setupExitIntent() {
        let mouseLeaveDelay;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !this.exitIntentTriggered) {
                mouseLeaveDelay = setTimeout(() => {
                    this.showExitIntent();
                }, 1000);
            }
        });
        
        document.addEventListener('mouseenter', () => {
            if (mouseLeaveDelay) {
                clearTimeout(mouseLeaveDelay);
            }
        });
        
        // Setup exit popup close handlers
        document.querySelector('.exit-close')?.addEventListener('click', () => {
            this.hideExitIntent();
        });
        
        document.querySelector('.exit-get-quote')?.addEventListener('click', () => {
            this.hideExitIntent();
            document.querySelector('#quote')?.scrollIntoView({ behavior: 'smooth' });
        });
        
        document.querySelector('.exit-call-now')?.addEventListener('click', () => {
            window.location.href = 'tel:+1-555-275-4678';
        });
    }
    
    showExitIntent() {
        if (this.exitIntentTriggered) return;
        
        const popup = document.getElementById('exit-intent-popup');
        const content = document.getElementById('exit-popup-content');
        
        if (popup && content) {
            this.exitIntentTriggered = true;
            popup.classList.remove('hidden');
            popup.classList.add('flex');
            
            setTimeout(() => {
                content.classList.add('scale-100');
                content.classList.remove('scale-95');
            }, 100);
            
            // Track exit intent
            this.trackEvent('conversion', 'exit_intent_shown', 'popup_displayed');
        }
    }
    
    hideExitIntent() {
        const popup = document.getElementById('exit-intent-popup');
        const content = document.getElementById('exit-popup-content');
        
        if (popup && content) {
            content.classList.add('scale-95');
            content.classList.remove('scale-100');
            
            setTimeout(() => {
                popup.classList.add('hidden');
                popup.classList.remove('flex');
            }, 300);
        }
    }
    
    setupLiveCounters() {
        // Animate live activity counters
        const updateCounters = () => {
            // Last quote counter (1-45 minutes)
            const lastQuoteMinutes = Math.floor(Math.random() * 45) + 1;
            const lastQuoteElement = document.querySelector('.live-counter');
            if (lastQuoteElement) {
                lastQuoteElement.innerHTML = `Last quote: <span class="text-ark-gold-500 font-bold">${lastQuoteMinutes} minutes ago</span>`;
            }
            
            // Policies counter (fluctuate between 45-52)
            const policiesElement = document.querySelector('.counter-policies');
            if (policiesElement) {
                const currentCount = parseInt(policiesElement.textContent) || 47;
                const newCount = Math.max(45, Math.min(52, currentCount + (Math.random() > 0.5 ? 1 : -1)));
                policiesElement.textContent = newCount;
            }
        };
        
        // Update every 30 seconds
        updateCounters();
        setInterval(updateCounters, 30000);
    }
    
    setupCountdownTimer() {
        const updateCountdown = () => {
            const now = new Date();
            const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // Dec 31st 11:59 PM
            const timeLeft = yearEnd.getTime() - now.getTime();
            
            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                document.querySelector('.countdown-days').textContent = days;
                document.querySelector('.countdown-hours').textContent = hours.toString().padStart(2, '0');
                document.querySelector('.countdown-minutes').textContent = minutes.toString().padStart(2, '0');
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }
    
    setupStickyElements() {
        // Chat tooltip animation
        const chatWidget = document.querySelector('.chat-widget');
        const chatTooltip = document.querySelector('.chat-tooltip');
        
        if (chatWidget && chatTooltip) {
            let tooltipTimer;
            
            const showTooltip = () => {
                chatTooltip.classList.remove('opacity-0');
                chatTooltip.classList.add('opacity-100');
            };
            
            const hideTooltip = () => {
                chatTooltip.classList.remove('opacity-100');
                chatTooltip.classList.add('opacity-0');
            };
            
            // Show tooltip every 10 seconds for 3 seconds
            const tooltipCycle = () => {
                showTooltip();
                setTimeout(hideTooltip, 3000);
            };
            
            tooltipCycle();
            setInterval(tooltipCycle, 10000);
            
            chatWidget.addEventListener('mouseenter', showTooltip);
            chatWidget.addEventListener('mouseleave', hideTooltip);
        }
        
        // Sticky phone button pulse
        const stickyPhone = document.querySelector('.sticky-phone');
        if (stickyPhone) {
            setInterval(() => {
                stickyPhone.classList.add('animate-bounce');
                setTimeout(() => {
                    stickyPhone.classList.remove('animate-bounce');
                }, 2000);
            }, 8000);
        }
    }
    
    setupLiveTicker() {
        const ticker = document.querySelector('.live-ticker');
        if (!ticker) return;
        
        const rates = [
            { age: '25yr', gender: 'Female', amount: '$250K', rate: '$22' },
            { age: '30yr', gender: 'Male', amount: '$500K', rate: '$45' },
            { age: '35yr', gender: 'Female', amount: '$1M', rate: '$78' },
            { age: '40yr', gender: 'Male', amount: '$750K', rate: '$89' },
            { age: '28yr', gender: 'Male', amount: '$500K', rate: '$38' }
        ];
        
        let currentIndex = 0;
        
        const updateTicker = () => {
            const rate = rates[currentIndex];
            const tickerItem = ticker.querySelector('.ticker-item');
            
            if (tickerItem) {
                tickerItem.innerHTML = `${rate.age} ${rate.gender} • ${rate.amount} • <span class="text-green-400">${rate.rate}/mo</span>`;
            }
            
            currentIndex = (currentIndex + 1) % rates.length;
        };
        
        updateTicker();
        setInterval(updateTicker, 4000);
        
        // Auto-hide ticker after 30 seconds, show again after 60 seconds
        let tickerVisible = true;
        const tickerCycle = () => {
            if (tickerVisible) {
                ticker.style.transform = 'translateX(-100%)';
                ticker.style.opacity = '0';
            } else {
                ticker.style.transform = 'translateX(0)';
                ticker.style.opacity = '1';
            }
            tickerVisible = !tickerVisible;
        };
        
        setTimeout(tickerCycle, 30000);
        setInterval(tickerCycle, 90000);
    }
    
    trackEvent(category, action, label) {
        // Enhanced tracking for conversion events
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: 1
            });
        }
        
        console.log(`Conversion Track: ${category} - ${action} - ${label}`);
    }
}

// ========================================
// APPLICATION INITIALIZATION
// ========================================
class ArkInsuranceApp {
    constructor() {
        this.controllers = {};
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        try {
            // Initialize AOS (Animate On Scroll)
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-out-cubic',
                    once: true,
                    offset: 50
                });
            }
            
            // Initialize controllers
            this.controllers.navigation = new NavigationController();
            this.controllers.quoteCalculator = new QuoteCalculator();
            this.controllers.contactForm = new ContactFormController();
            this.controllers.interactive = new InteractiveController();
            this.controllers.performance = new PerformanceOptimizer();
            this.controllers.analytics = new AnalyticsController();
            this.controllers.conversionDominance = new ConversionDominanceController();
            
            // App is ready
            document.body.classList.add('app-ready');
            console.log('Ark Insurance website initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Ark Insurance app:', error);
        }
    }
    
    // Public API methods
    showQuoteCalculator() {
        document.querySelector('#quote')?.scrollIntoView({ behavior: 'smooth' });
    }
    
    showContactForm() {
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// GLOBAL INITIALIZATION
// ========================================
window.ArkInsurance = new ArkInsuranceApp();

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ArkInsuranceApp, ArkUtils, FormValidator };
}