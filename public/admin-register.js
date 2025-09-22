document.getElementById('adminRegisterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const username = document.getElementById('username').value.trim();
  const department = document.getElementById('department').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  const res = await fetch('/api/admin/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, middleName, lastName, username, department, password })
  });

  if (res.ok) {
    alert('Admin registration successful! Please login.');
    window.location.href = 'admin-login.html';
  } else {
    const data = await res.json();
    alert(data.error || 'Error during registration');
  }
});
