//Install express server
const express = require("express")
const http = require("http")
const path = require("path")

const app = express()

app.set("port", 5000)

// Serve only the static files form the dist directory
// app.use(express.static(__dirname + "/src"))
var publicDir = path.join(__dirname, "src")

app.get("/", function (req, res) {
  res.sendFile(path.join(publicDir, "index.html"))
})

// Start the app by listening on the default Heroku port

var server = http.createServer(app)

require("reload")(app).then(() => {
  // Reload started, start web server
  server.listen(app.get("port"), function () {
    console.log("Web server listening on port " + app.get("port"))
  })
})
