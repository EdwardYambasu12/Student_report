let allComplaints = [];

async function loadComplaints() {
  const tbody = document.querySelector("#complaintsTable tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch("/api/complaints");
    allComplaints = await res.json();

    renderComplaints("All"); // default show all
  } catch (err) {
    console.error("Error fetching complaints:", err);
    tbody.innerHTML = "<tr><td colspan='5'>Error loading complaints</td></tr>";
  }
}

function renderComplaints(filter) {
  const tbody = document.querySelector("#complaintsTable tbody");
  const search = document.getElementById("searchBox").value.toLowerCase();

  let complaints = [];

  if (filter === "All") {
    complaints = allComplaints;
  } else if (filter === "Pending") {
    complaints = allComplaints.filter(c => c.status === "Pending");
  } else if (filter === "Solved") {
    complaints = allComplaints.filter(c => c.status === "Solved");
  }

  // Apply search
  if (search) {
    complaints = complaints.filter(c =>
      c.username.toLowerCase().includes(search) ||
      c.message.toLowerCase().includes(search)  // ✅ FIXED
    );
  }

  tbody.innerHTML = "";
  if (complaints.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No complaints found</td></tr>";
  } else {
    complaints.forEach((c) => {
      const shortText =
        c.message.length > 30 ? c.message.substring(0, 30) + "..." : c.message;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.username}</td>
        <td>${c.college}</td>
        <td>
          <span id="complaint-${c._id}">${shortText}</span>
          ${c.message.length > 30
            ? `<button class="read-more" onclick="toggleReadMore('${c._id}', '${c.message.replace(/'/g, "\\'")}')">Read More</button>`
            : ""}
        </td>
        <td class="${c.status === "Solved" ? "status-solved" : "status-pending"}">${c.status}</td>
        <td>
          ${c.status === "Pending"
            ? `<button onclick="markSolved('${c._id}')">Mark Solved</button>`
            : ""}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Filter change handler
document.getElementById("statusFilter").addEventListener("change", (e) => {
  renderComplaints(e.target.value);
});

// Search handler
document.getElementById("searchBox").addEventListener("input", () => {
  const filter = document.getElementById("statusFilter").value;
  renderComplaints(filter);
});

// Load data on page load
loadComplaints();
