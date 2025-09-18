document.getElementById('adminForgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmNewPassword) {
    alert('Passwords do not match!');
    return;
  }

  const res = await fetch('/api/admin/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, newPassword })
  });

  if (res.ok) {
    alert('Password reset successful! Please login.');
    window.location.href = 'admin-login.html';
  } else {
    const data = await res.json();
    alert(data.error || 'Error resetting password');
  }
});
