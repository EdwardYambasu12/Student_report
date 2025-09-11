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
