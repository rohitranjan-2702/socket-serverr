const server = require("http").createServer();

require("dotenv").config();

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 5000;

io.on("connection", async (socket) => {
  let studentId;
  let question;
  let teacherId;
  let tutorsVisited;

  //if conn with a student socket
  socket.on("studentConnected", (payload) => {
    studentId = payload.studentId;
    socket.join(studentId);
  });
  socket.on("questionAsked", (payload) => {
    question = payload.question;
    studentId = payload.studentId;
    console.log(`question asked by ${studentId}: ${question}`);
    socket.to("tutors").emit("questionAvailable", { studentId, question });
  });

  //if conn with a teacher socket
  socket.on("teacherOnline", (payload) => {
    teacherId = payload.teacherId;
    socket.join(teacherId);
    socket.join("tutors");
  });
  socket.on("questionAccepted", (payload) => {
    studentId = payload.studentId;
    teacherId = payload.teacherId;
    io.to("tutors").emit("removeQuestion", { studentId });
    io.to(studentId).to(teacherId).emit("moveToCall", { studentId, teacherId });
    // socket.to(teacherId).emit("moveToCall", { studentId, teacherId });
  });
});

server.listen(port, () => {
  console.log(`server active at ${port}...`);
});
