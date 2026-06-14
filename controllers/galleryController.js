const User = require("../models/user");
const Gallery = require("../models/gallery"); 
const Image = require("../models/image");
const { body, validationResult } = require("express-validator");

exports.getGalleryList = async (req, res, next) => {
  try {
    const galleries = await Gallery.find().populate("owner").sort({ date: -1 }).exec();
    res.render("gallery_list", {
      title: "Galerie",
      loggedUser: req.loggedUser,
      galleries: galleries
    });
  } catch (err) {
    return next(err);
  }
};

exports.getGalleryAdd = async (req, res, next) => {
  try {
    const loggedUser = req.loggedUser;

    if (loggedUser === "admin") {
      const all_users = await User.find().sort({ last_name: 1 }).exec();
      res.render("gallery_form", {
        title: "Dodaj galerię",
        loggedUser: loggedUser,
        users: all_users
      });
    } else {
      res.render("gallery_form_user", {
        title: "Dodaj galerię",
        loggedUser: loggedUser
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.postGalleryAdd = [
  body("g_name", "Nazwa galerii musi mieć conajmniej 2 znaki.").trim().isLength({ min: 2 }).escape(),
  body("g_description", "Opis galerii musi mieć conajmniej 2 znaki.").trim().isLength({ min: 2 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const loggedUser = req.loggedUser;
    let myMessages = [];

    try {
      let ownerId;
      if (loggedUser === "admin") {
        ownerId = req.body.g_user;
      } else {
        const currentUser = await User.findOne({ username: loggedUser }).exec();
        ownerId = currentUser._id;
      }

      const newGalleryData = {
        name: req.body.g_name,
        description: req.body.g_description,
        owner: ownerId
      };

      if (!errors.isEmpty()) {
        errors.array().forEach(err => myMessages.push(err.msg));
        
        if (loggedUser === "admin") {
          const all_users = await User.find().sort({ last_name: 1 }).exec();
          return res.render("gallery_form", {
            title: "Dodaj galerię:",
            loggedUser: loggedUser,
            users: all_users,
            gallery: newGalleryData,
            messages: myMessages
          });
        } else {
          return res.render("gallery_form_user", {
            title: "Dodaj galerię:",
            loggedUser: loggedUser,
            gallery: newGalleryData,
            messages: myMessages
          });
        }
      }

      const galleryExists = await Gallery.findOne({
        name: req.body.g_name,
        owner: ownerId
      }).exec();

      if (galleryExists) {
        myMessages.push(`Galeria "${req.body.g_name}" już istnieje!`);
        
        if (loggedUser === "admin") {
          const all_users = await User.find().sort({ last_name: 1 }).exec();
          return res.render("gallery_form", {
            title: "Dodaj galerię:",
            loggedUser: loggedUser,
            users: all_users,
            gallery: newGalleryData,
            messages: myMessages
          });
        } else {
          return res.render("gallery_form_user", {
            title: "Dodaj galerię:",
            loggedUser: loggedUser,
            gallery: newGalleryData,
            messages: myMessages
          });
        }
      }

      const newGallery = new Gallery({
        name: req.body.g_name,
        description: req.body.g_description,
        owner: ownerId
      });

      await newGallery.save();
      myMessages.push(`Galeria "${req.body.g_name}" dodana!`);

      if (loggedUser === "admin") {
        const all_users = await User.find().sort({ last_name: 1 }).exec();
        res.render("gallery_form", {
          title: "Dodaj galerię:",
          loggedUser: loggedUser,
          users: all_users,
          gallery: {},
          messages: myMessages
        });
      } else {
        res.render("gallery_form_user", {
          title: "Dodaj galerię:",
          loggedUser: loggedUser,
          gallery: {},
          messages: myMessages
        });
      }

    } catch (err) {
      return next(err);
    }
  }
];

exports.getGalleryBrowse = async (req, res, next) => {
  try {
    const galleryId = req.query.gallery_id;
    if (!galleryId) {
      return res.redirect('/galleries');
    }

    const loggedUser = req.loggedUser;
    const currentGallery = await Gallery.findById(galleryId).populate("owner").exec();
    
    if (!currentGallery) {
      return res.render("info", { title: "Błąd", messages: ["Ta galeria nie istnieje!"] });
    }

    const gallery_images = await Image.find({ gallery: galleryId }).exec();

    res.render("gallery_browse", {
      title: currentGallery.name,
      gallery: currentGallery,
      images: gallery_images,
      loggedUser: loggedUser
    });
  } catch (err) {
    next(err);
  }
};

exports.getGalleryDelete = async (req, res, next) => {
  try {
    const galleryId = req.query.gallery_id;
    const loggedUser = req.loggedUser;

    const gallery = await Gallery.findById(galleryId).exec();
    if (!gallery) {
      return res.render("info", { title: "Błąd", messages: ["Ta galeria nie istnieje!"] });
    }

    const imageCount = await Image.countDocuments({ gallery: galleryId }).exec();
    if (imageCount > 0) {
      return res.render("info", { 
        title: "Odmowa usunięcia", 
        messages: ["Nie można usunąć galerii, która zawiera zdjęcia! Najpierw usuń wszystkie zdjęcia z tej galerii."] 
      });
    }

    if (loggedUser !== "admin") {
      const currentUser = await User.findOne({ username: loggedUser }).exec();
      if (!currentUser || gallery.owner.toString() !== currentUser._id.toString()) {
        return res.render("info", { title: "Odmowa dostępu", messages: ["Możesz usuwać tylko własne galerie!"] });
      }
    }

    await Gallery.findByIdAndDelete(galleryId).exec();
    res.redirect("/galleries");
  } catch (err) {
    return next(err);
  }
};

exports.getGalleryUpdate = async (req, res, next) => {
  try {
    const galleryId = req.query.gallery_id;
    const loggedUser = req.loggedUser;

    const gallery = await Gallery.findById(galleryId).exec();
    if (!gallery) {
      return res.render("info", { title: "Błąd", messages: ["Ta galeria nie istnieje!"] });
    }

    if (loggedUser !== "admin") {
      const currentUser = await User.findOne({ username: loggedUser }).exec();
      if (!currentUser || gallery.owner.toString() !== currentUser._id.toString()) {
        return res.render("info", { title: "Odmowa dostępu", messages: ["Możesz edytować tylko własne galerie!"] });
      }
    }

    if (loggedUser === "admin") {
      const all_users = await User.find().sort({ last_name: 1 }).exec();
      res.render("gallery_update_form", {
        title: "Edytuj galerię",
        loggedUser: loggedUser,
        gallery: gallery,
        users: all_users
      });
    } else {
      res.render("gallery_update_form_user", {
        title: "Edytuj galerię",
        loggedUser: loggedUser,
        gallery: gallery
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.postGalleryUpdate = [
  body("g_name", "Nazwa galerii musi mieć conajmniej 2 znaki.").trim().isLength({ min: 2 }).escape(),
  body("g_description", "Opis galerii musi mieć conajmniej 2 znaki.").trim().isLength({ min: 2 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const galleryId = req.query.gallery_id;
    const loggedUser = req.loggedUser;

    try {
      const gallery = await Gallery.findById(galleryId).exec();
      if (!gallery) {
        return res.render("info", { title: "Błąd", messages: ["Ta galeria nie istnieje!"] });
      }

      let ownerId = gallery.owner;
      if (loggedUser !== "admin") {
        const currentUser = await User.findOne({ username: loggedUser }).exec();
        if (!currentUser || gallery.owner.toString() !== currentUser._id.toString()) {
          return res.render("info", { title: "Odmowa dostępu", messages: ["Możesz edytować tylko własne galerie!"] });
        }
        ownerId = currentUser._id;
      } else {
        ownerId = req.body.g_user || gallery.owner;
      }

      if (!errors.isEmpty()) {
        const tempGallery = { _id: gallery._id, name: req.body.g_name, description: req.body.g_description, owner: ownerId };
        let myMessages = errors.array().map(err => err.msg);

        if (loggedUser === "admin") {
          const all_users = await User.find().sort({ last_name: 1 }).exec();
          return res.render("gallery_update_form", { title: "Edytuj galerię)", loggedUser: loggedUser, gallery: tempGallery, users: all_users, messages: myMessages });
        } else {
          return res.render("gallery_update_form_user", { title: "Edytuj galerię", loggedUser: loggedUser, gallery: tempGallery, messages: myMessages });
        }
      }

      gallery.name = req.body.g_name;
      gallery.description = req.body.g_description;
      gallery.owner = ownerId;

      await gallery.save();
      res.redirect("/galleries");
    } catch (err) {
      return next(err);
    }
  }
];