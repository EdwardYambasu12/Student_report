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
