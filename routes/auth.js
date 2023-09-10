const express = require("express");

const router = express.Router();
const { check, body } = require("express-validator");

const authcontroller = require("../controllers/auth");

router.get("/login", authcontroller.getlogin);

router.post("/login", authcontroller.postlogin);

router.get("/logout", authcontroller.getlogout);

router.get("/signup", authcontroller.getsignup);

router.post(
  "/signup",
  [
    body("name", "Please enter atleast 4 character username").isLength({
      min: 4,
    }),
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "besthacker428@gmail.com") {
          throw new Error("This email is forbidden.");
        }
        return true;
      }),
    body(
      "password",
      "Please enter with number and text and atleast 6 character"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmpassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match");
        }
        return true;
      }),
    check("contactnumber").custom((value, { req }) => {
      var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (value.match(phoneno)) {
        return true;
      } else {
        throw new Error("Please enter a valid phone number");
      }
    }),
  ],
  authcontroller.postsignup
);

router.get("/forgotpassword", authcontroller.getforgotpassword);

router.post("/forgotpassword", authcontroller.postforgotpassword);

router.get("/reset/:token", authcontroller.getresetpassword);

router.post("/resetpassword", authcontroller.postresetpassword);

module.exports = router;
