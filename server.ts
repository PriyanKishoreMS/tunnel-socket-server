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

interface linkData {
	link: string;
	lport: string;
	rport: string;
}

let message: string = "";
let link: linkData = { link: "", lport: "", rport: "" };
const tunnels: linkData[] = [];
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
		console.log("redirecting to: ", link);
		console.log(tunnels);
		if (tunnels.findIndex(t => t.link === link.link) === -1) {
			tunnels.push(link);
		}
		res.render("tunnel", { tunnels });
	}, 1000);
});

app.post("/kill-tunnel", (req, res) => {
	const tunnel = JSON.parse(req.body.tunnel);
	console.log("killing tunnel: ", tunnel);
	io.emit("kill-tunnel", tunnel);
	setTimeout(() => {
		tunnels.splice(
			tunnels.findIndex(t => t.link === tunnel.link),
			1
		);
		res.render("tunnel", { tunnels });
	}, 1000);
});

io.on("connection", socket => {
	console.log("a user connected with id: ", socket.id);
	socket.on("message", msg => {
		console.log("message: " + msg);
		message = msg;
	});
	socket.on("tunnel-link", lnk => {
		link = lnk;
	});
});

httpServer.listen(3000, () => {
	console.log("listening on *:3000");
});
