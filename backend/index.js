const express = require("express");
const session = require("express-session");
const passport = require("./middlewares/googleAuth");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
require("dotenv").config();
require("./model/db");

const app = express();
const port = process.env.PORT || 8080;

// Import routers
const AuthRouter = require("./routes/AuthRouter");
const dashrouter = require("./routes/dashrouter");
const datasetRouter = require("./routes/datasetRouter");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", AuthRouter);
app.use("/dashboard", dashrouter);
app.use("/admin", dashrouter);
app.use("/dataset", datasetRouter);

// Start HTTPS server
const sslServer = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

sslServer.listen(port, () =>
  console.log(`Secure server running on https://localhost:${port}`)
);
