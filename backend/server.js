const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://alumnisphere:alumnisphere@cluster0.bwhgqnh.mongodb.net/?appName=Cluster0"
)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.log("Mongo Error:", err));


/* ========================
   MODELS
======================== */

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  studentSkills: [String]
});

const User = mongoose.model("User", UserSchema);

const MentorProfileSchema = new mongoose.Schema({
  userId: String,
  name: String,
  company: String,
  experience: String,
  skills: [String],
  bio: String,
});

const MentorProfile = mongoose.model("MentorProfile", MentorProfileSchema);

const RequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  mentorId: String,
  status: {
    type: String,
    default: "Pending"
  }
});

const Request = mongoose.model("Request", RequestSchema);

const SessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  date: String,
  time: String,
  status: {
    type: String,
    default: "Scheduled"
  }
});

const Session = mongoose.model("Session", SessionSchema);

const MessageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  receiverId: String,
  message: String,
  seen: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", MessageSchema);


const JWT_SECRET = "supersecretkey";

/* ========================
   AUTH ROUTES
======================== */

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log("Signup request for:", email);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    console.log("User created with ID:", user._id);
    
    res.json({ 
      message: "User created successfully",
      userId: user._id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found in database");
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    console.log("Login successful for user:", user.email, "ID:", user._id);
    res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

/* ========================
   USER PROFILE
======================== */

app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Fetching user with ID:", userId);
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User found:", user.email);
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).json({ error: "Failed to get user", details: err.message });
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const { name, email, studentSkills } = req.body;
    console.log("Updating user with ID:", req.params.id);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, studentSkills },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User updated successfully");
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
});

/* ========================
   MENTOR PROFILES
======================== */

app.post("/mentor-profile", async (req, res) => {
  const { userId, name, company, experience, skills, bio } = req.body;

  let profile = await MentorProfile.findOne({ userId });

  if (profile) {
    profile.name = name;
    profile.company = company;
    profile.experience = experience;
    profile.skills = skills;
    profile.bio = bio;
    await profile.save();
  } else {
    profile = new MentorProfile({
      userId,
      name,
      company,
      experience,
      skills,
      bio
    });
    await profile.save();
  }

  res.json({ message: "Profile saved successfully" });
});

app.get("/mentor-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching mentor profile for user ID:", userId);
    
    const profile = await MentorProfile.findOne({ userId });
    
    if (!profile) {
      console.log("Mentor profile not found, creating empty response");
      return res.status(404).json({ message: "Mentor profile not found" });
    }
    
    console.log("Mentor profile found");
    res.json(profile);
  } catch (err) {
    console.error("Error fetching mentor profile:", err.message);
    res.status(500).json({ error: "Failed to get mentor profile", details: err.message });
  }
});

app.put("/mentor-profile/:userId", async (req, res) => {
  try {
    const { name, company, experience, skills, bio } = req.body;
    const userId = req.params.userId;
    console.log("Updating mentor profile for user ID:", userId);
    
    const profile = await MentorProfile.findOneAndUpdate(
      { userId },
      { name, company, experience, skills, bio },
      { new: true, upsert: true }
    );
    
    console.log("Mentor profile updated successfully");
    res.json({ message: "Mentor profile updated successfully", profile });
  } catch (err) {
    console.error("Error updating mentor profile:", err.message);
    res.status(500).json({ error: "Failed to update mentor profile", details: err.message });
  }
});

/* ========================
   DEBUG ENDPOINTS
======================== */

app.get("/debug/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    console.log("Total users in database:", users.length);
    users.forEach(u => console.log("- User:", u.email, "ID:", u._id, "Role:", u.role));
    res.json({
      totalUsers: users.length,
      users: users.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

app.post("/debug/create-test-user", async (req, res) => {
  try {
    // Delete existing test user if any
    await User.deleteOne({ email: "test@student.com" });
    
    const hashedPassword = await bcrypt.hash("test123", 10);
    const user = new User({
      name: "Test Student",
      email: "test@student.com",
      password: hashedPassword,
      role: "Student",
      studentSkills: ["JavaScript", "React", "MongoDB"]
    });

    await user.save();
    
    console.log("Test user created with ID:", user._id);
    
    res.json({
      message: "Test user created successfully",
      userId: user._id,
      email: user.email,
      password: "test123",
      role: "Student"
    });
  } catch (err) {
    console.error("Error creating test user:", err.message);
    res.status(500).json({ error: "Failed to create test user", details: err.message });
  }
});

app.post("/debug/create-test-mentor", async (req, res) => {
  try {
    // Delete existing test mentor if any
    await User.deleteOne({ email: "test@mentor.com" });
    
    const hashedPassword = await bcrypt.hash("test123", 10);
    const user = new User({
      name: "Test Mentor",
      email: "test@mentor.com",
      password: hashedPassword,
      role: "Mentor",
      studentSkills: []
    });

    await user.save();
    
    // Create mentor profile
    const profile = new MentorProfile({
      userId: user._id.toString(),
      name: "Test Mentor",
      company: "Tech Company",
      experience: "5+ years",
      skills: ["JavaScript", "React", "Node.js"],
      bio: "Experienced mentor ready to help"
    });
    
    await profile.save();
    
    console.log("Test mentor created with ID:", user._id);
    
    res.json({
      message: "Test mentor created successfully",
      userId: user._id,
      email: user.email,
      password: "test123",
      role: "Mentor"
    });
  } catch (err) {
    console.error("Error creating test mentor:", err.message);
    res.status(500).json({ error: "Failed to create test mentor", details: err.message });
  }
});

app.delete("/debug/clear-all-users", async (req, res) => {
  try {
    await User.deleteMany({});
    await MentorProfile.deleteMany({});
    await Request.deleteMany({});
    await Session.deleteMany({});
    console.log("All users and data cleared");
    res.json({ message: "All data cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear data", details: err.message });
  }
});

/* Smart Matching */
app.get("/mentor-profiles/:studentId", async (req, res) => {
  const { studentId } = req.params;

  const student = await User.findById(studentId);
  const profiles = await MentorProfile.find();

  const ranked = profiles.map(profile => {
    const matchScore = profile.skills.filter(skill =>
      student.studentSkills?.includes(skill)
    ).length;

    return { ...profile._doc, matchScore };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore);
  res.json(ranked);
});

/* ========================
   REQUESTS
======================== */

app.post("/request-mentorship", async (req, res) => {
  const { studentId, mentorId } = req.body;

  const request = new Request({
    studentId,
    mentorId
  });

  await request.save();
  res.json({ message: "Request sent successfully" });
});

app.get("/mentor-requests/:mentorId", async (req, res) => {
  const { mentorId } = req.params;

  const requests = await Request.find({ mentorId })
    .populate("studentId", "name email");

  res.json(requests);
});

app.put("/update-request/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const request = await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );

  res.json(request);
});

/* ========================
   SESSIONS
======================== */

app.post("/book-session", async (req, res) => {
  const { studentId, mentorId, date, time } = req.body;

  const session = new Session({
    studentId,
    mentorId,
    date,
    time
  });

  await session.save();
  res.json({ message: "Session booked successfully" });
});

app.get("/sessions/:userId", async (req, res) => {
  const { userId } = req.params;

  const sessions = await Session.find({
    $or: [{ studentId: userId }, { mentorId: userId }]
  }).populate("studentId mentorId", "name email");

  res.json(sessions);
});

app.get("/admin/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await User.countDocuments({ role: "Mentor" });
    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalSessions = await Session.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalRequests = await Request.countDocuments();

    res.json({
      totalUsers,
      totalMentors,
      totalStudents,
      totalSessions,
      totalMessages,
      totalRequests
    });
  } catch (err) {
    res.status(500).json({ error: "Admin stats failed" });
  }
});

app.get("/admin/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

app.delete("/admin/user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});


/* ========================
   SOCKET.IO CHAT
======================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", async ({ senderId, receiverId }) => {
    const roomId =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    socket.join(roomId);

    // Load previous chat history
    const history = await Message.find({ roomId }).sort({ timestamp: 1 });
    socket.emit("chatHistory", history);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    const roomId =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;

    const newMessage = new Message({
      roomId,
      senderId,
      receiverId,
      message
    });

    await newMessage.save();

    io.to(roomId).emit("receiveMessage", newMessage);
  });

  socket.on("markSeen", async ({ roomId, receiverId }) => {
    await Message.updateMany(
      { roomId, receiverId, seen: false },
      { seen: true }
    );

    io.to(roomId).emit("messagesSeen");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(5000, () =>
  console.log("Server running with advanced Socket.io chat")
);
