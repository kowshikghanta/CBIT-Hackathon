// app.js

document.addEventListener("DOMContentLoaded", function () {
    setupForms();
    setupLogout();
    showPage('login'); // Always start at login
});

// Page navigation logic
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    pages.forEach(el => el.classList.remove('active'));
    const page = document.getElementById(pageId + 'Page');
    if (page) page.classList.add('active');

    // Navbar visibility
    const navbar = document.getElementById('mainNavbar');
    if (['dashboard', 'upload'].includes(pageId)) {
        navbar.classList.remove('d-none');
        if (pageId === 'dashboard') loadDashboard();
    } else {
        navbar.classList.add('d-none');
    }
}

// Attach form handlers
function setupForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) uploadForm.addEventListener('submit', handleUpload);
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            fetch('/logout', { method: 'POST', credentials: 'include' })
                .finally(() => showPage('login'));
        });
    }
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    ajaxPost('/api/login', { email, password }, (resp) => {
        if (resp.success) {
            showPage('dashboard');
        } else {
            alert(resp.message || "Login failed");
        }
    });
}

// Signup Handler
function handleSignup(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    ajaxPost('/api/signup', { fullName, email, phone, password }, (resp) => {
        if (resp.success) {
            showPage('dashboard');
        } else {
            alert(resp.message || "Signup failed");
        }
    });
}

// Upload Handler
function handleUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return alert("Choose a file first!");

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    ajaxUpload('/api/upload', formData, (resp) => {
        if (resp.success && resp.filePath) {
            ajaxPost('/api/analyze', { filePath: resp.filePath }, (analysisResp) => {
                if (analysisResp.success) {
                    showPage('dashboard');
                } else {
                    alert("Analysis failed: " + analysisResp.message);
                }
            });
        } else {
            alert(resp.message || "Upload failed");
        }
    });
}

// Load Dashboard
function loadDashboard() {
    fetch('/api/dashboard/data', { credentials: 'include' })
        .then(r => r.json())
        .then(resp => {
            const container = document.getElementById('dashboardContent');
            container.innerHTML = '';
            if (resp.success && resp.creditScore) {
                const score = resp.creditScore.creditScore;
                const status = getScoreStatus(score);
                let html = `<div class="mb-3"><strong>Credit Score: ${score}</strong> <span>${status}</span></div>`;
                
                if (resp.creditScore.breakdown) {
                    html += `<div><strong>Breakdown:</strong><ul>`;
                    resp.creditScore.breakdown.forEach(item => {
                        html += `<li>${item.name}: ${item.value}</li>`;
                    });
                    html += `</ul></div>`;
                }

                if (resp.creditScore.recommendations) {
                    html += `<div><strong>Recommendations:</strong><ul>`;
                    resp.creditScore.recommendations.forEach(rec => {
                        html += `<li>${rec}</li>`;
                    });
                    html += `</ul></div>`;
                }

                container.innerHTML = html;

                // Initialize charts if chart-config.js is included
                if (typeof initializeCharts === "function") {
                    fetch('/api/dashboard/chart-data')
                        .then(r => r.json())
                        .then(result => {
                            if (result.success) initializeCharts(result.chartData);
                        });
                }

            } else {
                container.innerHTML = `<div class="alert alert-warning">No dashboard data. Upload a file first.</div>`;
            }
        });
}

// Score Status
function getScoreStatus(score) {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
}

// AJAX Helpers
function ajaxPost(url, data, cb) {
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(cb)
    .catch(() => cb({ success: false, message: 'Server error' }));
}

function ajaxUpload(url, formData, cb) {
    fetch(url, { method: 'POST', body: formData, credentials: 'include' })
        .then(r => r.json())
        .then(cb)
        .catch(() => cb({ success: false, message: 'Server error' }));
}
