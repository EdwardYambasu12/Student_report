const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  department: { type: String, required: true },
  complaint: { type: String, required: true },
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
