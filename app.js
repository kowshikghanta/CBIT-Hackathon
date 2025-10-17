// Application State Management
let currentPage = 'login';
let uploadedFiles = [];
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page navigation
    showPage('login');
    
    // Initialize upload functionality
    initializeFileUpload();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Add animation classes to elements
    addAnimationClasses();
    
    // Simulate user login status (remove in production)
    // This is just for demo purposes
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Page Navigation Functions
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId + 'Page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.classList.add('fade-in');
    }
    
    // Update current page
    currentPage = pageId;
    
    // Show/hide navigation based on page
    const navbar = document.getElementById('mainNavbar');
    if (pageId === 'upload' || pageId === 'dashboard') {
        navbar.classList.remove('d-none');
        isLoggedIn = true;
    } else {
        navbar.classList.add('d-none');
    }
    
    // Page-specific initializations
    if (pageId === 'dashboard') {
        initializeDashboard();
    }
}

// Authentication Functions
function simulateLogin() {
    // This simulates a login process
    // In production, this would make an actual API call
    showPage('upload');
}

function simulateSignup() {
    // This simulates a signup process
    // In production, this would make an actual API call
    showPage('upload');
}

function logout() {
    isLoggedIn = false;
    uploadedFiles = [];
    showPage('login');
    
    // Reset forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Clear uploaded files display
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
    const fileList = document.getElementById('fileList');
    if (uploadedFilesDiv && fileList) {
        uploadedFilesDiv.style.display = 'none';
        fileList.innerHTML = '';
    }
    
    // Reset upload button states
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (uploadBtn) uploadBtn.disabled = true;
    if (analyzeBtn) analyzeBtn.style.display = 'none';
}

// File Upload Functions
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!uploadZone || !fileInput) return;
    
    // Drag and drop functionality
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    });
    
    // Click to upload
    uploadZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });
    
    // Upload button click
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            simulateFileUpload();
        });
    }
}

function handleFileSelection(files) {
    const allowedTypes = ['.pdf', '.csv', '.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        const isValidType = allowedTypes.includes(extension);
        const isValidSize = file.size <= maxSize;
        
        if (!isValidType) {
            showAlert('Invalid file type: ' + file.name + '. Please upload PDF, CSV, or Excel files.', 'warning');
            return false;
        }
        
        if (!isValidSize) {
            showAlert('File too large: ' + file.name + '. Maximum size is 10MB.', 'warning');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length > 0) {
        uploadedFiles = [...uploadedFiles, ...validFiles];
        displayUploadedFiles();
        
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = false;
        }
    }
}

function displayUploadedFiles() {
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
    const fileList = document.getElementById('fileList');
    
    if (!uploadedFilesDiv || !fileList) return;
    
    if (uploadedFiles.length > 0) {
        uploadedFilesDiv.style.display = 'block';
        fileList.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = createFileItem(file, index);
            fileList.appendChild(fileItem);
        });
    } else {
        uploadedFilesDiv.style.display = 'none';
    }
}

function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item slide-up';
    
    const extension = file.name.split('.').pop().toLowerCase();
    let iconClass = 'fas fa-file';
    let iconColor = 'text-secondary';
    
    switch (extension) {
        case 'pdf':
            iconClass = 'fas fa-file-pdf';
            iconColor = 'text-danger';
            break;
        case 'csv':
            iconClass = 'fas fa-file-csv';
            iconColor = 'text-success';
            break;
        case 'xlsx':
        case 'xls':
            iconClass = 'fas fa-file-excel';
            iconColor = 'text-primary';
            break;
    }
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="${iconClass} ${iconColor} file-icon"></i>
            <div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
        </div>
        <i class="fas fa-times file-remove" onclick="removeFile(${index})"></i>
    `;
    
    return fileItem;
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayUploadedFiles();
    
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn && uploadedFiles.length === 0) {
        uploadBtn.disabled = true;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function simulateFileUpload() {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!uploadProgress || !progressBar || !progressText || !uploadBtn) return;
    
    // Show progress
    uploadProgress.style.display = 'block';
    uploadBtn.disabled = true;
    uploadBtn.classList.add('loading');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        progressText.textContent = `Uploading files... ${Math.round(progress)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            
            setTimeout(() => {
                progressText.textContent = 'Files uploaded successfully!';
                uploadBtn.classList.remove('loading');
                uploadBtn.style.display = 'none';
                
                if (analyzeBtn) {
                    analyzeBtn.style.display = 'block';
                    analyzeBtn.classList.add('slide-up');
                }
                
                showAlert('Files uploaded successfully! You can now analyze your credit score.', 'success');
            }, 500);
        }
    }, 200);
}

function analyzeCredit() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.classList.add('loading');
        analyzeBtn.disabled = true;
    }
    
    // Simulate analysis process
    setTimeout(() => {
        showPage('dashboard');
        showAlert('Credit score analysis completed!', 'success');
    }, 2000);
}

// Dashboard Functions
function initializeDashboard() {
    // Animate credit score circle
    animateCreditScore();
    
    // Animate progress bars
    animateProgressBars();
    
    // Load dashboard data (in production, this would be an API call)
    loadDashboardData();
}

function animateCreditScore() {
    const scoreElement = document.querySelector('.score-value');
    if (!scoreElement) return;
    
    const targetScore = 750;
    let currentScore = 0;
    const increment = targetScore / 50;
    
    const animation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        scoreElement.textContent = Math.round(currentScore);
    }, 30);
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.breakdown-item .progress-bar');
    
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            // The width is already set in HTML, this just adds the animation
        }, index * 200);
    });
}

function loadDashboardData() {
    // In production, this would fetch real data from your Spring Boot backend
    // For now, we'll use static data that matches the Thymeleaf structure
    
    const dashboardData = {
        creditScore: {
            value: 750,
            status: 'Good'
        },
        lastUpdated: new Date().toLocaleDateString(),
        creditBreakdown: [
            { name: 'Payment History', value: 85 },
            { name: 'Credit Utilization', value: 65 },
            { name: 'Credit History Length', value: 75 },
            { name: 'New Credit Accounts', value: 70 },
            { name: 'Credit Mix', value: 80 }
        ],
        recommendations: [
            'Pay down credit card balances',
            'Keep old accounts open',
            'Limit new credit inquiries',
            'Set up automatic payments'
        ],
        recentTransactions: [
            {
                date: '2024-01-15',
                description: 'Credit Card Payment',
                category: 'Payment',
                amount: '$500.00',
                impact: 'Positive'
            },
            {
                date: '2024-01-12',
                description: 'Online Purchase',
                category: 'Purchase',
                amount: '$125.50',
                impact: 'Neutral'
            }
        ]
    };
    
    // This data structure is ready for Thymeleaf integration
    console.log('Dashboard data loaded:', dashboardData);
}

// Form Validation Functions
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (form.id === 'loginForm' || form.closest('#loginPage')) {
                e.preventDefault();
                validateLoginForm(form);
            } else if (form.id === 'signupForm' || form.closest('#signupPage')) {
                e.preventDefault();
                validateSignupForm(form);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                if (input.classList.contains('is-invalid')) {
                    validateField(input);
                }
            });
        });
    });
}

function validateLoginForm(form) {
    const email = form.querySelector('#email');
    const password = form.querySelector('#password');
    
    let isValid = true;
    
    if (!validateField(email)) isValid = false;
    if (!validateField(password)) isValid = false;
    
    if (isValid) {
        // Simulate login process
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        
        setTimeout(() => {
            simulateLogin();
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }, 1500);
    }
}

function validateSignupForm(form) {
    const fullName = form.querySelector('#fullName');
    const email = form.querySelector('#signupEmail');
    const phone = form.querySelector('#phone');
    const password = form.querySelector('#signupPassword');
    const confirmPassword = form.querySelector('#confirmPassword');
    const agreeTerms = form.querySelector('#agreeTerms');
    
    let isValid = true;
    
    if (!validateField(fullName)) isValid = false;
    if (!validateField(email)) isValid = false;
    if (!validateField(phone)) isValid = false;
    if (!validateField(password)) isValid = false;
    if (!validateField(confirmPassword)) isValid = false;
    if (!validateField(agreeTerms)) isValid = false;
    
    // Check password match
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }
    
    if (isValid) {
        // Simulate signup process
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        
        setTimeout(() => {
            simulateSignup();
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }, 1500);
    }
}

function validateField(field) {
    if (!field) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && field.value.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }
    
    // Password validation
    if (field.type === 'password' && field.value.trim() && field.id !== 'confirmPassword') {
        if (field.value.length < 8) {
            errorMessage = 'Password must be at least 8 characters long';
            isValid = false;
        }
    }
    
    // Checkbox validation
    if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
            errorMessage = 'You must agree to the terms and conditions';
            isValid = false;
        }
    }
    
    if (isValid) {
        showFieldSuccess(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    let feedback = field.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
    }
    feedback.textContent = message;
}

function showFieldSuccess(field) {
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
    
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 400px;';
    
    let icon = 'fas fa-info-circle';
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'danger':
            icon = 'fas fa-exclamation-circle';
            break;
    }
    
    alert.innerHTML = `
        <i class="${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentNode.remove()"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function addAnimationClasses() {
    // Add animation classes to cards and other elements
    const cards = document.querySelectorAll('.card');
    const authCards = document.querySelectorAll('.auth-card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
    
    authCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('slide-up');
        }, index * 100);
    });
}

// Event Listeners for Demo Navigation (remove in production)
document.addEventListener('click', function(e) {
    // Handle demo navigation clicks
    if (e.target.classList.contains('signup-link') || e.target.textContent.includes('Create Account')) {
        e.preventDefault();
        showPage('signup');
    } else if (e.target.classList.contains('login-link') || e.target.textContent.includes('Sign In')) {
        e.preventDefault();
        showPage('login');
    }
});

// Keyboard shortcuts (for demo purposes)
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + number keys for quick page navigation (demo only)
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const pages = ['login', 'signup', 'upload', 'dashboard'];
        const pageIndex = parseInt(e.key) - 1;
        if (pageIndex < pages.length) {
            showPage(pages[pageIndex]);
        }
    }
});

// Export functions for potential use in Thymeleaf templates
window.BankingApp = {
    showPage,
    logout,
    analyzeCredit,
    simulateLogin,
    simulateSignup,
    handleFileSelection,
    removeFile,
    showAlert
};