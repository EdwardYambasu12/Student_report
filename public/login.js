document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentId = document.getElementById('studentId').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password })
  });

  if (res.ok) {
    // ✅ Save the studentId in localStorage
    localStorage.setItem("studentId", studentId);
    console.log("Login successful, studentId saved:", studentId);
    window.location.href = 'student.html';
  } else {
    alert('Invalid login');
  }
});

