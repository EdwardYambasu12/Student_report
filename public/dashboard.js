async function loadComplaints() {
  const tbody = document.querySelector("#complaintsTable tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch("/api/complaints");
    const complaints = await res.json();

    tbody.innerHTML = "";

    complaints.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.studentId}</td>
        <td>${c.department}</td>
        <td>${c.message}</td>
        <td class="${c.status === "Solved" ? "status-solved" : "status-pending"}">${c.status}</td>
        <td>
          ${c.status === "Pending" ? `<button onclick="markSolved('${c._id}')">Mark Solved</button>` : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='5'>Error loading complaints</td></tr>";
  }
}

async function markSolved(id) {
  try {
    await fetch(`/api/complaints/${id}/solve`, { method: "PUT" });
    loadComplaints(); // Refresh table
  } catch (err) {
    alert("Failed to mark as solved");
  }
}

document.addEventListener("DOMContentLoaded", loadComplaints);
