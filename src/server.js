import express from "express";

const app = express();

// express
// setting views
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// frond-end part (user only can watch)
app.use("/public", express.static(__dirname + "/public"));

// rendering home
app.get("/", (req, res) => res.render("home"));

//catch unnormal url
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

app.listen(3000, handleListen);