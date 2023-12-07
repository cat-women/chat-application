const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

const corsOptions = {
  // origin: "http://localhost:5173",
  origin: "*",
  optionSuccessStatus: 200,
};

app.use(cors());

app.use(express.json()); // to accept json data

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ----------deployment----------------

if (process.env.NODE_ENV === "production") {
  const frontend_build_path = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontend_build_path));

  app.get("*", (req, res) => res.sendFile(path.resolve(frontend_build_path, "index.html")));
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = 4000;

const server = app.listen(PORT, console.log(`Server running on PORT ${PORT}...`));

//  to store active user
const activeUser = {}


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",

  },
});

io.on("connection", (socket) => {

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);

  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });


  // Video chatting 

  socket.emit("me", socket.id);

  // Handle new user connection
  socket.on('newUser', (userId) => {

    socket.userId = userId;
    activeUser[userId] = socket.id;
    socket.broadcast.emit('userConnected', userId);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });

  socket.on("callUser", ({ userToCall, signalData, from, name, isVideoCall }) => {
    const userToCallSocketId = activeUser[userToCall._id];
    const callerSocketId = activeUser[from];
    io.to(userToCallSocketId).emit("callUser", { signal: signalData, from: callerSocketId, name, isVideoCall, userToCall, callerId: from });
  });


  socket.on("leaveCall", ({ userToCall, isVideoCall }) => {
    const userToCallSocketId = activeUser[userToCall];
    io.to(userToCallSocketId).emit("leaveCall", { isVideoCall });
  });


  socket.on("cancelCall", ({ userToCall, isVideoCall }) => {
    const userToCallSocketId = activeUser[userToCall];
    console.log("cancel call called ", userToCallSocketId)
    io.to(userToCallSocketId).emit("cancelCall", { isVideoCall });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });





  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
