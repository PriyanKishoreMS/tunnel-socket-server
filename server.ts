import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
const app = express();
import { user } from "./data";

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_, res) => {
	res.render("root");
});

let message: string = "";
app.post("/connectUser", (req, res) => {
	const { name, password, address } = req.body;
	if (name != user.name || password != user.password) {
		res.render("notAllowed");
		return;
	}
	io.emit("formData", { name, password, address });
	setTimeout(() => {
		res.render("network", { message });
	}, 500);
});

app.post("/tunnel", (req, res) => {
	const { lport, rport } = req.body;
	console.log("tunneling to port: ", { lport, rport });
	io.emit("open-tunnel", { lport, rport });
	setTimeout(() => {
		console.log("redirecting to: ", message);
		return res.redirect(`http://${message}`);
	}, 1000);
});

io.on("connection", socket => {
	console.log("a user connected with id: ", socket.id);
	socket.on("message", msg => {
		console.log("message: " + msg);
	});
	socket.on("message", msg => {
		message = msg;
	});
});

httpServer.listen(3000, () => {
	console.log("listening on *:3000");
});
