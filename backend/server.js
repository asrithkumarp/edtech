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
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role
  });

  await user.save();
  res.json({ message: "User created successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role, userId: user._id });
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
