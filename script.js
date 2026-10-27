// YOUR GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjMK1lGvdpwJ-QD6ATH5dCSZM0SvM2vugkcEVVvhGHZKfyxEjIelixXFIMqMRq88Uu/exec";

let currentUser = null;

// Auth Tab Switcher
function switchAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
}

// Sign Up
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const studentId = document.getElementById('signupStudentId').value;
  const password = document.getElementById('signupPassword').value;

  const btn = document.getElementById('signupBtn');
  btn.innerText = "Registering..."; btn.disabled = true;

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'signup', name, studentId, password })
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    btn.innerText = "Sign Up"; btn.disabled = false;
    if (res.status === 'success') switchAuthTab('login');
  })
  .catch(err => { console.error(err); btn.innerText = "Sign Up"; btn.disabled = false; });
});

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const studentId = document.getElementById('loginStudentId').value;
  const password = document.getElementById('loginPassword').value;

  const btn = document.getElementById('loginBtn');
  btn.innerText = "Authenticating..."; btn.disabled = true;

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'login', studentId, password })
  })
  .then(res => res.json())
  .then(res => {
    btn.innerText = "Login"; btn.disabled = false;
    if (res.status === 'success') {
      currentUser = res;
      document.getElementById('userDisplayName').innerText = res.name;
      document.getElementById('authSection').classList.add('hidden');
      document.getElementById('dashboardSection').classList.remove('hidden');
      
      // Fetch / Retrieve Data from Google Sheet
      retrieveHistory();
    } else {
      alert(res.message);
    }
  })
  .catch(err => { console.error(err); btn.innerText = "Login"; btn.disabled = false; });
});

// Logout
function logout() {
  currentUser = null;
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
}

// Multi-Sector Smart Recommendation Engine
function generateRecommendations(career, skillsGained) {
  const lower = skillsGained.toLowerCase();
  let recs = [];

  if (career === "Full-Stack Developer") {
    if (!lower.includes("javascript") && !lower.includes("js")) recs.push("Learn Modern JavaScript (ES6+)");
    if (!lower.includes("react")) recs.push("Learn React.js Frontend Framework");
    if (!lower.includes("node")) recs.push("Learn Node.js & Express Backend");
    if (!lower.includes("sql") && !lower.includes("mongo")) recs.push("Learn Databases (MySQL / MongoDB)");
  } else if (career === "Data Scientist") {
    if (!lower.includes("python")) recs.push("Master Python Programming");
    if (!lower.includes("pandas")) recs.push("Master Data Wrangling (Pandas & NumPy)");
    if (!lower.includes("machine learning")) recs.push("Learn Machine Learning Algorithms");
  } else if (career === "Digital Marketing Manager") {
    if (!lower.includes("seo")) recs.push("Master Search Engine Optimization (SEO)");
    if (!lower.includes("ads")) recs.push("Learn Google & Meta Paid Ad Campaigns");
    if (!lower.includes("analytics")) recs.push("Master Google Analytics 4");
  } else if (career === "Mechanical Design Engineer") {
    if (!lower.includes("solidworks")) recs.push("Master SolidWorks / CATIA 3D Modeling");
    if (!lower.includes("fea") && !lower.includes("ansys")) recs.push("Learn FEA & ANSYS Simulation");
  } else if (career === "Financial Analyst") {
    if (!lower.includes("excel")) recs.push("Master Advanced Excel & Financial Modeling");
    if (!lower.includes("power bi") && !lower.includes("tableau")) recs.push("Learn Data Visualization (Power BI / Tableau)");
  } else {
    recs = ["Master Advanced Core Industry Tools", "Build Real-World Portfolio Projects", "Obtain Industry Certification"];
  }

  if (recs.length === 0) recs.push("Advanced System Architecture / Project Management", "Build End-to-End Capstone Portfolio");
  return recs;
}

// Save Recommendation to Google Sheet (Store)
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const careerInterest = document.getElementById('careerInterest').value;
  const currentSkills = document.getElementById('currentSkills').value;

  const recs = generateRecommendations(careerInterest, currentSkills);
  const recsText = recs.join(" | ");

  // UI Display
  document.getElementById('recommendationOutput').innerHTML = `
    <ul class="rec-list">
      ${recs.map(item => `<li><i class="fa-solid fa-circle-check" style="color:#4f46e5;"></i> ${item}</li>`).join('')}
    </ul>
  `;

  const btn = document.getElementById('recommendBtn');
  btn.innerText = "Saving to Google Sheet..."; btn.disabled = true;

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'saveRecommendation',
      studentId: currentUser.studentId,
      careerInterest,
      currentSkills,
      recommendedSkills: recsText
    })
  })
  .then(res => res.json())
  .then(res => {
    alert("Saved successfully to Google Sheet!");
    btn.innerText = "Analyze & Save Recommendation"; btn.disabled = false;
    retrieveHistory(); // Refresh table data
  })
  .catch(err => {
    console.error(err);
    btn.innerText = "Analyze & Save Recommendation"; btn.disabled = false;
  });
});

// Retrieve Past Recommendations from Google Sheet (Retrieve)
function retrieveHistory() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">Fetching records...</td></tr>';

  fetch(`${SCRIPT_URL}?studentId=${currentUser.studentId}`)
    .then(res => res.json())
    .then(res => {
      if (res.status === "success" && res.data.length > 0) {
        tbody.innerHTML = '';
        res.data.reverse().forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${row.timestamp}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>${row.careerInterest}</strong></td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${row.currentSkills}</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${row.recommendedSkills}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px;">No past records found.</td></tr>';
      }
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px; color: red;">Error retrieving records.</td></tr>';
    });
}