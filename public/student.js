// Hardcoded college → departments mapping
const collegeDepartments = {
  "College of Agriculture and Food Sciences": [
    "Department of General Agriculture",
    "Department of Agribusiness",
    "Department of Forestry",
    "Department of Environmental Science"
  ],
  "College of Engineering and Technology": [
    "Department of Civil Engineering",
    "Department of Electrical Engineering",
    "Department of Mechanical Engineering",
    "Department of Architecture"
  ],
  "College of Health Sciences": [
    "Department of Nursing",
    "Department of Public Health",
    "Department of Midwifery",
    "Department of Pharmacy"
  ],
  "College of Education": [
    "Department of Primary Education",
    "Department of Secondary Education",
    "Department of Special Education"
  ],
  "College of Arts and Sciences": [
    "Department of English",
    "Department of Social Sciences",
    "Department of Biological Sciences",
    "Department of Chemistry",
    "Department of Physics",
    "Department of Mathematics"
  ],
  "College of Management and Administration": [
    "Department of Accounting",
    "Department of Management",
    "Department of Economics",
    "Department of Public Administration"
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  // Logout button functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
  const collegeSelect = document.getElementById("college");
  const deptSelect = document.getElementById("studentDepartment");

  // Update department dropdown when college is selected
  collegeSelect.addEventListener("change", () => {
    const selectedCollege = collegeSelect.value;
    deptSelect.innerHTML = '<option value="">-- Select Department --</option>';

    if (collegeDepartments[selectedCollege]) {
      collegeDepartments[selectedCollege].forEach(dep => {
        const option = document.createElement("option");
        option.value = dep;
        option.textContent = dep;
        deptSelect.appendChild(option);
      });
    }
  });
});


document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const department = document.getElementById('department').value;
  const message = document.getElementById('message').value;

  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ department, message })
  });

  if (res.ok) {
    alert('Complaint submitted');
    document.getElementById('message').value = '';
  } else {
    alert('Error submitting complaint');
  }

});
document.addEventListener("DOMContentLoaded", () => {
  const studentId = localStorage.getItem("studentId");
  console.log("Retrieved studentId from localStorage:", studentId);

  if (!studentId) {
    // If no ID found, redirect back to login
    window.location.href = "index.html";
    return;
  }

  // Show student ID on page
  document.getElementById("studentId").textContent = studentId;

  // 🔍 Now you can use studentId to fetch previous complaints
  fetch(`/api/complaints?studentId=${studentId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Student complaints:", data);
      // render last complaint if needed
    });
});
