const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");
const mongoose = require("mongoose");
const User = require("./models/user");
const app = express();
const helmet = require("helmet");
require("dotenv").config();
const fs = require("fs");
// const stripe = require("stripe")(process.env.STRIPE_KEY);

const MongoDBuri = process.env.MONGO_URL;
const port = process.env.PORT || 3000;

const store = new MongoDBStore({
  uri: MongoDBuri,
  collection: "session",
});

const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./images";
    if (!fs.existsSync(path.join(__dirname, dir))) {
      fs.mkdirSync(path.join(__dirname, dir));
    }
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(
  multer({ storage: filestorage, fileFilter: filefilter }).single("imgurl")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());
app.use(helmet());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

adminRoutes = require("./routes/admin");
shopRoutes = require("./routes/shop");
authRoutes = require("./routes/auth");

app.use("/home", (req, res, next) => {
  res.render("mainhome", {
    path: "/mainhome",
    isauth: req.session.isloggedin,
  });
});

app.use(shopRoutes);
app.use(adminRoutes);
app.use(authRoutes);

mongoose
  .connect(MongoDBuri, { useNewUrlParser: true })
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.log(err);
  });
