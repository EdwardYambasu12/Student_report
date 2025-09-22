const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://sportsup14:a4gM6dGvo7SHk9aX@cluster0.db0ee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



// ================== Schemas ==================
// User Schema (students)
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  username: String,            // student username
  problemDepartment: String,   // area of problem
  college: String,             // student’s college
  studentDepartment: String,   // student’s department
  message: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  department: String
});

const Admin = mongoose.model("Admin", adminSchema);

// Seed default admin

const User = mongoose.model('User_', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);


// ================== Sessions ==================
app.use(session({
  secret: 'smart-school-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://sportsup14:a4gM6dGvo7SHk9aX@cluster0.db0ee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ================== Middleware ==================
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({ error: "Unauthorized (admin only)" });
  }
  next();
}

// ================== Routes ==================
// Student register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Register attempt:', username);
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Student login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = { id: user._id, username: user.username };
    res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


// Student logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// ================== Complaints ==================
// Admin: Assign complaint to department
app.put("/api/complaints/:id/assign", requireAdmin, async (req, res) => {
  try {
    const { department } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { department },
      { new: true }
    );
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign department" });
  }
});

// Admin: Get new complaints assigned to their department (for notifications)
app.get('/api/department-tasks/notifications', requireAdmin, async (req, res) => {
  try {
    const adminUsername = req.session.admin.username;
    const admin = await Admin.findOne({ username: adminUsername });
    if (!admin || !admin.department) {
      return res.status(400).json({ error: 'Admin department not found' });
    }
    // Optionally, filter by createdAt > lastChecked (frontend can send lastChecked)
    const { lastChecked } = req.query;
    let query = { department: admin.department };
    if (lastChecked) {
      query.createdAt = { $gt: new Date(lastChecked) };
    }
    const newTasks = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(newTasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch department notifications' });
  }
});
// Student: Get their own complaints
app.get('/api/my-complaints', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const complaints = await Complaint.find({ username: req.session.user.username }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});
app.post('/api/complaints', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  const { college, department, message, username } = req.body;

  const complaint = new Complaint({ 
    username, 
    college, 
    department, 
    message 
  });
  console.log('New complaint:', complaint);
  await complaint.save();
  res.json({ message: 'Complaint submitted' });
});

// Get all complaints (admin only)
app.get("/api/complaints", requireAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Mark complaint as solved
app.put("/api/complaints/:id/solve", requireAdmin, async (req, res) => {
  try {
    const adminUsername = req.session.admin.username;
    const admin = await Admin.findOne({ username: adminUsername });
    if (!admin || !admin.department) {
      return res.status(403).json({ error: "Admin department not found" });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    if (complaint.department !== admin.department) {
      return res.status(403).json({ error: "You can only solve complaints in your department" });
    }
    complaint.status = "Solved";
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

// Delete complaint
app.delete("/api/complaints/:id", requireAdmin, async (req, res) => {
  try {
    const adminUsername = req.session.admin.username;
    const admin = await Admin.findOne({ username: adminUsername });
    if (!admin || !admin.department) {
      return res.status(403).json({ error: "Admin department not found" });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    if (complaint.department !== admin.department) {
      return res.status(403).json({ error: "You can only delete complaints in your department" });
    }
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

// ================== Users ==================
// Get all users (admin only)
app.get("/api/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ================== Admin ==================
// Admin register (only an admin can add another admin)
app.post("/api/admin/register", requireAdmin, async (req, res) => {
  const { username, password, department, firstName, middleName, lastName } = req.body;
  try {
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: "Admin already exists" });

    const admin = new Admin({ username, password, department, firstName, middleName, lastName });
    await admin.save();
    res.json({ message: "New admin added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add admin" });
  }
});

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    req.session.admin = { id: admin._id, username: admin.username };
    res.json({ message: "Login successful", admin: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: "Failed to login admin" });
  }
});

// Admin logout
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Admin logged out" });
});

// ================== Start Server ==================
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
