const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 3000;

app.use("/static", express.static(__dirname + '/static'));

app.get("/", (req, res) => {
    console.log(req, res);
    res.sendFile(__dirname + "/index.html");
});

http.listen(port, () => {
    console.log(`Listening on *: ${port}`);
});