document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = document.getElementById('studentId').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password })
  });

  if (res.ok) {
    alert('Registration successful! Please login.');
    window.location.href = 'index.html';
  } else {
    const data = await res.json();
    alert(data.error || 'Error during registration');
  }
});
