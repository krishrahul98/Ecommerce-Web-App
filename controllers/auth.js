const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

exports.getLogin = (req, res) => {
  let errorMessage = req.flash("error");
  if (!errorMessage.length) {
    errorMessage = null;
  }
  let successMessage = req.flash("success");
  if (!successMessage.length) {
    successMessage = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    successMessage: successMessage,
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      successMessage: "",
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Server Side Error Please try again");
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash("error");
  if (!message.length) {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      console.log("Signup Successful");
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "Rahul Krishna <admin@krishrahul98.me>",
        subject: "Signup Successful - Ecommerce-Rahul",
        html: "<h1>You successfully signed up!</h1><br><br><hr><p>Rahul Krishna</p><br><a href='https://ecommerce.rahul.cf/'>Ecommerce-Rahul</a>",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res) => {
  let message = req.flash("error");
  if (!message.length) {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Password Reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/reset");
    } else {
      const token = buffer.toString("hex");
      User.findOne({ email: req.body.email })
        .then((user) => {
          if (!user) {
            req.flash("error", "No account with that email found.");
            res.redirect("/reset");
          } else {
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            user
              .save()
              .then(() => {
                req.flash("success", "Check your email for password reset");
                res.redirect("/login");
                transporter.sendMail({
                  to: req.body.email,
                  from: "Rahul Krishna <admin@krishrahul98.me>",
                  subject: "Password Reset Link - Ecommerce-Rahul",
                  html: `<p>You requested a password Reset.</p>
                <p>Click this link to reset your password. Link will expire in <b>1 hour</b>.</p>
                <a href="${process.env.MYURL}/reset/${token}">${process.env.MYURL}/reset/${token}</a>
                <br><br><hr><p>Rahul Krishna</p><br><a href='https://ecommerce.rahul.cf/'>Ecommerce-Rahul</a>`,
                });
              })
              .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
              });
          }
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    }
  });
};

exports.getNewPassword = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (!errorMessage.length) {
    errorMessage = null;
  }
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (user) {
        res.render("auth/new-password", {
          path: "/new-password",
          pageTitle: "Update Password",
          errorMessage: errorMessage,
          userId: user._id.toString(),
          passwordToken: token,
        });
      } else {
        req.flash("error", "Invalid Password Reset Link");
        res.redirect("/login");
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      req.flash("success", "Password Updated successfully.");
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
