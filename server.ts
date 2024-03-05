import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
	console.log("a user connected with id: ", socket.id);

	socket.on("message", msg => {
		console.log("message: " + msg);
	});
});

httpServer.listen(3000, () => {
	console.log("listening on *:3000");
});
