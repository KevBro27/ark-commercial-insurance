// Ark Commercial Insurance - Advanced JavaScript Functionality
// Professional B2B insurance website with conversion optimization

class CommercialQuoteCalculator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
    }

    setupEventListeners() {
        // Next button
        const nextBtn = document.querySelector('.quote-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        // Previous button
        const prevBtn = document.querySelector('.quote-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }

        // Submit button
        const submitBtn = document.querySelector('.quote-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => this.submitQuote(e));
        }

        // Form validation
        const form = document.querySelector('.business-quote-calculator');
        if (form) {
            form.addEventListener('change', () => this.validateCurrentStep());
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }

    previousStep() {
        this.currentStep--;
        this.showStep(this.currentStep);
        this.updateProgress();
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.quote-step').forEach(stepEl => {
            stepEl.classList.add('hidden');
        });

        // Show current step
        const currentStepEl = document.querySelector(`[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.classList.remove('hidden');
        }

        // Update buttons
        this.updateButtons();
    }

    updateButtons() {
        const nextBtn = document.querySelector('.quote-next-btn');
        const prevBtn = document.querySelector('.quote-prev-btn');
        const submitBtn = document.querySelector('.quote-submit-btn');

        // Previous button
        if (prevBtn) {
            if (this.currentStep === 1) {
                prevBtn.classList.add('hidden');
            } else {
                prevBtn.classList.remove('hidden');
            }
        }

        // Next/Submit buttons
        if (this.currentStep === this.totalSteps) {
            if (nextBtn) nextBtn.classList.add('hidden');
            if (submitBtn) submitBtn.classList.remove('hidden');
        } else {
            if (nextBtn) nextBtn.classList.remove('hidden');
            if (submitBtn) submitBtn.classList.add('hidden');
        }
    }

    updateProgress() {
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                indicator.classList.add('bg-green-500');
                indicator.classList.remove('bg-ark-brown-600', 'bg-gray-200');
                indicator.innerHTML = '<i class="fas fa-check text-white"></i>';
            } else if (stepNumber === this.currentStep) {
                indicator.classList.add('bg-ark-brown-600');
                indicator.classList.remove('bg-green-500', 'bg-gray-200');
                indicator.textContent = stepNumber;
            } else {
                indicator.classList.add('bg-gray-200');
                indicator.classList.remove('bg-green-500', 'bg-ark-brown-600');
                indicator.textContent = stepNumber;
            }
        });

        // Update progress bars
        document.querySelectorAll('.step-progress').forEach((progress, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                progress.classList.add('bg-green-500');
                progress.classList.remove('bg-gray-200');
            } else {
                progress.classList.add('bg-gray-200');
                progress.classList.remove('bg-green-500');
            }
        });

        // Update step number
        const stepNumberEl = document.querySelector('.current-step-number');
        if (stepNumberEl) {
            stepNumberEl.textContent = this.currentStep;
        }
    }

    validateCurrentStep() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return true;

        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepEl) return;

        const inputs = currentStepEl.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!this.formData[input.name]) this.formData[input.name] = [];
                if (input.checked) {
                    this.formData[input.name].push(input.value);
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    calculatePremium() {
        const industry = this.formData.industry || 'other';
        const employees = this.formData.employees || '1-5';
        const revenue = this.formData.revenue || 'under100k';
        const coverage = this.formData['coverage[]'] || [];

        // Base rates by industry (annual)
        const industryRates = {
            'restaurant': 2800,
            'retail': 2200,
            'construction': 4500,
            'professional': 1800,
            'technology': 2000,
            'healthcare': 3200,
            'manufacturing': 3500,
            'other': 2400
        };

        // Employee multipliers
        const employeeMultipliers = {
            '1-5': 1.0,
            '6-20': 1.4,
            '21-50': 1.8,
            '51-100': 2.2,
            '100+': 2.8
        };

        // Revenue multipliers
        const revenueMultipliers = {
            'under100k': 0.8,
            '100k-500k': 1.0,
            '500k-1m': 1.2,
            '1m-5m': 1.5,
            '5m+': 2.0
        };

        // Coverage add-ons
        const coverageRates = {
            'general-liability': 800,
            'workers-comp': 1200,
            'commercial-property': 900,
            'professional-liability': 1100,
            'cyber-liability': 1400,
            'commercial-auto': 1600
        };

        let basePremium = industryRates[industry] || 2400;
        basePremium *= employeeMultipliers[employees] || 1.0;
        basePremium *= revenueMultipliers[revenue] || 1.0;

        // Add coverage costs
        let coverageCost = 0;
        coverage.forEach(cov => {
            coverageCost += coverageRates[cov] || 0;
        });

        const totalPremium = Math.round(basePremium + coverageCost);
        const savings = Math.round(totalPremium * 0.25); // 25% average savings

        return { premium: totalPremium, savings: savings };
    }

    submitQuote(e) {
        e.preventDefault();
        this.saveCurrentStepData();

        if (this.validateCurrentStep()) {
            const results = this.calculatePremium();
            this.showResults(results);
        }
    }

    showResults(results) {
        // Hide form
        const form = document.querySelector('.business-quote-calculator');
        if (form) {
            form.style.display = 'none';
        }

        // Show results
        const resultsDiv = document.querySelector('.quote-results');
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            
            const premiumEl = resultsDiv.querySelector('.estimated-premium');
            const savingsEl = resultsDiv.querySelector('.potential-savings');
            
            if (premiumEl) premiumEl.textContent = `$${results.premium.toLocaleString()}`;
            if (savingsEl) savingsEl.textContent = `$${results.savings.toLocaleString()}`;
        }

        // Analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'commercial_quote_completed', {
                'premium_amount': results.premium,
                'savings_amount': results.savings,
                'industry': this.formData.industry
            });
        }
    }
}

class CommercialConversionDominanceController {
    constructor() {
        this.exitIntentTriggered = false;
        this.scrollThreshold = 0.7;
        this.init();
    }

    init() {
        this.setupExitIntent();
        this.setupLiveCounters();
        this.setupBusinessSocialProof();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    }

    setupExitIntent() {
        let isExiting = false;
        
        document.addEventListener('mouseout', (e) => {
            if (!this.exitIntentTriggered && !isExiting && e.clientY <= 0) {
                isExiting = true;
                this.showExitIntentPopup();
                
                setTimeout(() => {
                    isExiting = false;
                }, 1000);
            }
        });

        // Mobile exit intent (scroll to top quickly)
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop < lastScrollTop && scrollTop < 100 && !this.exitIntentTriggered) {
                this.showExitIntentPopup();
            }
            lastScrollTop = scrollTop;
        });
    }

    showExitIntentPopup() {
        if (this.exitIntentTriggered) return;
        
        this.exitIntentTriggered = true;
        const popup = document.getElementById('exit-intent-popup');
        const content = document.getElementById('exit-popup-content');
        
        if (popup && content) {
            popup.classList.remove('hidden');
            
            setTimeout(() => {
                content.style.transform = 'scale(1)';
            }, 100);

            // Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exit_intent_triggered', {
                    'page_type': 'commercial'
                });
            }
        }
    }

    setupLiveCounters() {
        // Business counter
        const businessCounterEl = document.querySelector('.counter-businesses');
        if (businessCounterEl) {
            let count = 127;
            setInterval(() => {
                count += Math.floor(Math.random() * 3); // 0-2 new businesses
                businessCounterEl.textContent = count;
            }, 30000); // Every 30 seconds
        }

        // Last quote timer
        const lastQuoteEl = document.querySelector('.live-business-counter span');
        if (lastQuoteEl) {
            let minutes = 8;
            setInterval(() => {
                minutes = Math.floor(Math.random() * 15) + 1; // 1-15 minutes
                lastQuoteEl.textContent = `${minutes} minutes ago`;
            }, 45000); // Every 45 seconds
        }
    }

    setupBusinessSocialProof() {
        // Rotate business testimonials
        const testimonials = document.querySelectorAll('[data-aos="fade-up"]');
        if (testimonials.length > 3) {
            setInterval(() => {
                const randomTestimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
                randomTestimonial.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    randomTestimonial.style.transform = 'scale(1)';
                }, 2000);
            }, 8000);
        }
    }

    setupSmoothScrolling() {
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
    }

    setupMobileMenu() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
}

// Business-specific form handlers
class CommercialFormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupBusinessContactForm();
        this.setupQuoteButtons();
        this.setupAgentCalls();
    }

    setupBusinessContactForm() {
        const forms = document.querySelectorAll('.business-contact-form, .business-quote-preview-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBusinessSubmission(form);
            });
        });
    }

    setupQuoteButtons() {
        const quoteButtons = document.querySelectorAll('.get-business-quote-btn');
        
        quoteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const quoteSection = document.getElementById('quote');
                if (quoteSection) {
                    quoteSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'business_quote_clicked', {
                        'button_location': button.closest('section')?.id || 'unknown'
                    });
                }
            });
        });
    }

    setupAgentCalls() {
        const callButtons = document.querySelectorAll('.speak-agent-btn, [href^="tel:"]');
        
        callButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'business_phone_clicked', {
                        'call_type': 'commercial_specialist'
                    });
                }
            });
        });
    }

    handleBusinessSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Show success message
        this.showBusinessSuccessMessage(form);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'business_form_submitted', {
                'form_type': form.classList.contains('business-contact-form') ? 'contact' : 'quote_preview',
                'industry': data.industry || 'not_specified'
            });
        }
        
        // Reset form
        setTimeout(() => {
            form.reset();
        }, 2000);
    }

    showBusinessSuccessMessage(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
        successMessage.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span><strong>Success!</strong> Your business inquiry has been received. We'll contact you within 24 hours.</span>
            </div>
        `;
        
        form.parentNode.insertBefore(successMessage, form);
        
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
}

// Global functions
function closeExitPopup() {
    const popup = document.getElementById('exit-intent-popup');
    const content = document.getElementById('exit-popup-content');
    
    if (content) {
        content.style.transform = 'scale(0)';
    }
    
    setTimeout(() => {
        if (popup) {
            popup.classList.add('hidden');
        }
    }, 300);
}

// Main Commercial Application Class
class ArkCommercialInsuranceApp {
    constructor() {
        this.quoteCalculator = null;
        this.conversionController = null;
        this.formHandler = null;
    }

    initializeApp() {
        console.log('Initializing Ark Commercial Insurance Application...');
        
        try {
            // Initialize core components
            this.quoteCalculator = new CommercialQuoteCalculator();
            this.conversionController = new CommercialConversionDominanceController();
            this.formHandler = new CommercialFormHandler();
            
            console.log('✅ Ark Commercial Insurance app initialized successfully');
            
            // Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'commercial_app_loaded', {
                    'page_type': 'commercial_insurance',
                    'agent': 'kevin_brown_jr'
                });
            }
            
        } catch (error) {
            console.error('Error initializing Ark Commercial Insurance app:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const commercialApp = new ArkCommercialInsuranceApp();
    commercialApp.initializeApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ArkCommercialInsuranceApp,
        CommercialQuoteCalculator,
        CommercialConversionDominanceController,
        CommercialFormHandler
    };
}