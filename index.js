//Install express server
const express = require("express")
const http = require("http")
const path = require("path")

const app = express()
let child = require("child_process")

app.set("port", 5000)

// Serve only the static files form the dist directory
// app.use(express.static(__dirname + "/src"))
app.use(express.static(__dirname + "/"))
var publicDir = path.join(__dirname, "/")

app.get("/", function (req, res) {
  let index = child.execSync("cat src/index.html").toString("UTF-8")
  let contenido = child.execSync("cat src/contenido.html").toString("UTF-8")

  index = index.replace("{{REMPLAZAR_AQUI}}", contenido)

  res.send(index)
})

// app.get("/*", (req, res) =>
//   res.sendFile(path.join(__dirname + "/dist/index.html"))
// )

// Start the app by listening on the default Heroku port

var server = http.createServer(app)

require("reload")(app).then(() => {
  // Reload started, start web server
  server.listen(app.get("port"), function () {
    console.log("Web server listening on port " + app.get("port"))
  })
})
