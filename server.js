const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcrypt');
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

// Schemas
const userSchema = new mongoose.Schema({
  studentId: String,
  password: String
});
const complaintSchema = new mongoose.Schema({
  studentId: String,
  department: String,
  message: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

// Sessions
app.use(session({
  secret: 'smart-school-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://sportsup14:a4gM6dGvo7SHk9aX@cluster0.db0ee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/register', async (req, res) => {
  const { studentId, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ studentId, password: hashed });
  await user.save();
  res.json({ message: 'User registered' });
});

app.post('/api/login', async (req, res) => {
  const { studentId, password } = req.body;
  const user = await User.findOne({ studentId });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { id: user._id, studentId: user.studentId };
  res.json({ message: 'Login successful' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Submit complaint
app.post('/api/complaints', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const { department, message } = req.body;
  const complaint = new Complaint({
    studentId: req.session.user.studentId,
    department,
    message
  });
  await complaint.save();
  res.json({ message: 'Complaint submitted' });
});

// Get complaints (dashboard)
// Fetch all complaints
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Mark complaint as solved
app.put("/api/complaints/:id/solve", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "Solved" },
      { new: true }
    );
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to update complaint" });
  }
});

// Mark solved
app.post('/api/complaints/:id/solve', async (req, res) => {
  const { id } = req.params;
  await Complaint.findByIdAndUpdate(id, { status: 'Solved' });
  res.json({ message: 'Complaint marked as solved' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
