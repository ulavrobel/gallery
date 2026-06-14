const User = require("../models/user");
const Gallery = require("../models/gallery");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.getUserAdd = (req, res, next) => {
    res.render("user_add", {
        title: "Dodaj nowego użytkownika",
        loggedUser: req.loggedUser
    });
};

exports.postUserAdd = async (req, res, next) => {
    try {
      const existingUser = await User.findOne({ username: req.body.username }).exec();
  
      if (existingUser) {
        return res.render("user_add", {
          title: "Dodaj użytkownika",
          loggedUser: req.loggedUser,
          messages: [`Błąd: Użytkownik o loginie "${req.body.username}" już istnieje! Wybierz inny login.`]
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
      const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hashedPassword
      });
  
      await newUser.save();

      res.render("user_add", { 
        title: "Dodaj użytkownika",
        loggedUser: req.loggedUser,
        messages: [`Sukces: Użytkownik "${req.body.username}" został pomyślnie dodany!`]
      });
  
    } catch (err) {
      if (err.code === 11000) {
        return res.render("user_add", {
          title: "Dodaj użytkownika",
          loggedUser: req.loggedUser,
          messages: ["Błąd krytyczny: Ten login jest już zajęty w bazie danych!"]
        });
      }
      return next(err);
    }
  };

exports.getUserLogin = (req, res, next) => {
  res.render("user_login_form", { title: "Zaloguj się" });
};

exports.postUserLogin = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  
  User.findOne({ username })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            res.render("user_login_form", { title: "Zaloguj się", loggedUser: req.loggedUser, messages: ["Some bcrypt errors!"] });
            return;
          }
          if (result) {
            let token = jwt.sign({ username: user.username }, 'e4b9c1d5-8f3a-4e2b-9d7c-1a2b3c4d5e6f', { expiresIn: '1h' });
            res.cookie('mytoken', token, { maxAge: 600000 });

            res.render('index', { title: 'Galeria', loggedUser: user.username });
          } else {
            res.render("user_login_form", { title: "Zaloguj się", loggedUser: req.loggedUser, messages: ["Niepoprawne dane logowania!"] });
          }
        });
      } else {
        res.render("user_login_form", { title: "Zaloguj się", loggedUser: req.loggedUser, messages: ["Nie znaleziono użytkownika!"] });
      }
    })
    .catch((err) => next(err));
};

exports.getUserLogout = (req, res, next) => {
  res.clearCookie('mytoken');
  res.render('index', { title: 'Galeria', loggedUser: undefined });
};

exports.getUserList = async (req, res, next) => {
    try {
      const users = await User.find().sort({ last_name: 1 }).exec();
      res.render("user_list", {
        title: "Lista użytkowników",
        loggedUser: req.loggedUser,
        users: users
      });
    } catch (err) {
      return next(err);
    }
  };

  exports.getUserDelete = async (req, res, next) => {
    try {
      const userId = req.query.user_id;
  
      const userToDelete = await User.findById(userId).exec();
      if (!userToDelete) {
        return res.render("info", { title: "Błąd", messages: ["Użytkownik nie istnieje!"] });
      }

      if (userToDelete.username === "admin") {
        return res.render("info", { 
          title: "Odmowa", 
          messages: ["Nie możesz usunąć głównego konta administratora!"] 
        });
      }

      const userGalleries = await Gallery.countDocuments({ owner: userId }).exec();
      if (userGalleries > 0) {
        return res.render("info", { 
          title: "Odmowa usunięcia", 
          messages: [`Ten użytkownik posiada przypisane galerie (${userGalleries}). Zanim go usuniesz, przypisz jego galerie komuś innemu poprzez opcję Edytuj galerię lub całkowicie je usuń!`] 
        });
      }

      await User.findByIdAndDelete(userId).exec();

      res.redirect("/users/user_list");
    } catch (err) {
      return next(err);
    }
  };