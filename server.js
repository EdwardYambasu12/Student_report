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

// Schemas
// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  username: String,            // instead of studentId
  problemDepartment: String,   // area of problem
  college: String,             // student’s college
  studentDepartment: String,   // student’s department
  message: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});


const User= mongoose.model('User_', userSchema);
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
// register route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
console.log('Register attempt:', username);
  try {
    // check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
         console.log('Username already exists:', username, existingUser);
      return res.status(400).json({ message: 'Username already exists' });
   
    }

    // create new user with plain text password
    const user = new User({ username, password });
    await user.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// backend login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // find by username instead of studentId
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // store session info
    req.session.user = { id: user._id, username: user.username };

    res.json({ 
      message: 'Login successful', 
      user: { id: user._id, username: user.username } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Submit complaint
app.post('/api/complaints', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const { college, message, username } = req.body;


  const complaint = new Complaint({
    username,
    college,
    message
  });
  console.log('New complaint:', complaint);
  await complaint.save();
  res.json({ message: 'Complaint submitted' });
});

// Get all complaints
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

// Get all users (for admin dashboard)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "studentId password"); // Only return ID & password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
