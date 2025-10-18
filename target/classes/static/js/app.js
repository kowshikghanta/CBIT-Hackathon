// app.js

document.addEventListener("DOMContentLoaded", function () {
  setupForms();
  showPage('login'); // Always start at login
});

// Page navigation logic
function showPage(pageId) {
  const pages = document.querySelectorAll('.page-container');
  pages.forEach(el => el.classList.remove('active'));
  const page = document.getElementById(pageId + 'Page');
  if (page) page.classList.add('active');
  document.getElementById('mainNavbar').classList.toggle('d-none', !['dashboard', 'upload'].includes(pageId));
  if (pageId === 'dashboard') loadDashboardData(true);
}

// Attach form handlers
function setupForms() {
  // LOGIN FORM
  const loginForm = document.querySelector('#loginPage form');
  if (loginForm)
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError(loginForm);
      const email = loginForm.querySelector('#email').value;
      const password = loginForm.querySelector('#password').value;
      ajaxPost('/api/login', { email, password }, function (resp) {
        if (resp.success) {
          showPage('dashboard');
          loadDashboardData(true);
        } else {
          showError(loginForm, resp.message || "Login failed.");
        }
      });
    });

  // SIGNUP FORM
  const signupForm = document.querySelector('#signupPage form');
  if (signupForm)
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError(signupForm);
      const fullName = signupForm.querySelector('#fullName').value;
      const email = signupForm.querySelector('#signupEmail').value;
      const phone = signupForm.querySelector('#signupPhone').value;
      const password = signupForm.querySelector('#signupPassword').value;
      ajaxPost('/api/signup', { fullName, email, phone, password }, function (resp) {
        if (resp.success) {
          showPage('dashboard');
          loadDashboardData(true);
        } else {
          showError(signupForm, resp.message || "Signup failed.");
        }
      });
    });

  // UPLOAD FORM
  const uploadForm = document.querySelector('#uploadPage form');
  if (uploadForm)
    uploadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fileInput = document.getElementById('fileInput');
      if (!fileInput.files.length) return alert("Choose a file first!");
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      ajaxUpload('/api/upload', formData, function (resp) {
        if (resp.success && resp.filePath) {
          ajaxPost('/api/analyze', { filePath: resp.filePath }, function (analysisResp) {
            if (analysisResp.success) {
              showPage('dashboard');
              loadDashboardData(true);
            } else {
              alert("Analysis failed: " + analysisResp.message);
            }
          });
        } else {
          alert(resp.message || "Upload failed.");
        }
      });
    });
}

// AJAX helpers
function ajaxPost(url, data, cb) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })
    .then(r => r.json())
    .then(cb)
    .catch(() => cb({ success: false, message: "Server error." }));
}

function ajaxUpload(url, formData, cb) {
  fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })
    .then(r => r.json())
    .then(cb)
    .catch(() => cb({ success: false, message: "Server error." }));
}

// Dashboard data loader
function loadDashboardData(force = false) {
  const dash = document.getElementById('dashboardPage');
  fetch('/api/dashboard/data', { credentials: 'include' })
    .then(r => r.json())
    .then(resp => {
      dash.querySelector('div').innerHTML = ""; // Clear previous
      if (resp.success && resp.creditScore) {
        dash.querySelector('h2').textContent = "Credit Score Dashboard";
        dash.querySelector('.text-muted').textContent = "Your analysis as of " + (resp.lastUpdated || "");
        let html = `
          <div><strong>Credit Score: ${resp.creditScore.creditScore}</strong> 
          <span>${getScoreStatus(resp.creditScore.creditScore)}</span></div>`;
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
        dash.querySelector('div').innerHTML = html;
      } else if (force) {
        dash.querySelector('div').innerHTML = `<div class="alert alert-danger">No dashboard data available. Please upload a file for analysis.</div>`;
      }
    });
}
function getScoreStatus(score) {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 600) return 'Poor';
  return 'Very Poor';
}

// Error utilities
function showError(form, msg) {
  clearError(form);
  let err = document.createElement('div');
  err.className = 'form-error text-danger mt-2 mb-2';
  err.textContent = msg;
  form.appendChild(err);
}
function clearError(form) {
  const err = form.querySelector('.form-error');
  if (err) err.remove();
}

// Logout logic (with SPA navigation)
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.textContent.trim().toLowerCase() === 'logout') {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      fetch('/logout', { credentials: 'include' })
        .then(() => showPage('login'));
    });
  }
});
