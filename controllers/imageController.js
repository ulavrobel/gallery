const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const Image = require('../models/image');
const Gallery = require('../models/gallery');
const User = require('../models/user');

exports.getImageUpload = async (req, res, next) => {
    try {
        let userGalleries;

        if (req.loggedUser === "admin") {
            userGalleries = await Gallery.find().exec();
        } else {
            const currentUser = await User.findOne({ username: req.loggedUser }).exec();
            userGalleries = await Gallery.find({ owner: currentUser._id }).exec();
        }
        
        res.render('image_form', { 
            title: 'Dodaj obrazek', 
            galleries: userGalleries,
            loggedUser: req.loggedUser 
        });
    } catch(err) {
        next(err);
    }
};

exports.postImageUpload = (req, res, next) => {
    const uploadDir = path.join(__dirname, '../public/images');

    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return next(err);
        }

        try {
            const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
            const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
            const galleryId = Array.isArray(fields.gallery) ? fields.gallery[0] : fields.gallery;
            
            const file = Array.isArray(files.imageFile) ? files.imageFile[0] : files.imageFile;

            if (!file || !file.newFilename) {
                return res.render('info', { title: 'Błąd', messages: ['Brak załączonego pliku!'] });
            }

            const relativePath = '/images/' + path.basename(file.newFilename || file.filepath);

            const newImage = new Image({
                name: name,
                description: description,
                path: relativePath,
                gallery: galleryId
            });

            await newImage.save();
            
            res.render('info', { 
                title: 'Sukces', 
                loggedUser: req.loggedUser,
                messages: [`Obrazek "${name}" został pomyślnie dodany do galerii!`] 
            });

        } catch (error) {
            next(error);
        }
    });
};

exports.getImageDelete = async (req, res, next) => {
    try {
        const imageId = req.query.image_id;
        const image = await Image.findById(imageId).exec();
        
        if (!image) {
            return res.render('info', { title: 'Błąd', messages: ['Obrazek nie istnieje!'] });
        }

        const filePath = path.join(__dirname, '../public', image.path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }

        await Image.findByIdAndDelete(imageId).exec();

        res.redirect('/galleries');

    } catch (err) {
        next(err);
    }
};

exports.getImageUpdate = async (req, res, next) => {
    try {
        const imageId = req.query.image_id;
        const image = await Image.findById(imageId).exec();

        let userGalleries;
        if (req.loggedUser === "admin") {
            userGalleries = await Gallery.find().exec();
        } else {
            const currentUser = await User.findOne({ username: req.loggedUser }).exec();
            userGalleries = await Gallery.find({ owner: currentUser._id }).exec();
        }

        res.render('image_update_form', {
            title: 'Edytuj obrazek',
            image: image,
            galleries: userGalleries,
            loggedUser: req.loggedUser
        });
    } catch (err) {
        next(err);
    }
};

exports.postImageUpdate = async (req, res, next) => {
    try {
        const filter = { _id: req.query.image_id };
        const update = {
            name: req.body.i_name,
            description: req.body.i_description,
            gallery: req.body.i_gallery
        };

        const doc = await Image.findOneAndUpdate(filter, update).exec();
        
        if (doc) {
            res.redirect('/galleries');
        } else {
            res.render('info', { title: 'Błąd', messages: ['Błąd podczas aktualizacji obrazka.'] });
        }
    } catch (err) {
        next(err);
    }
};

exports.postImageComment = async (req, res, next) => {
    try {
        const imageId = req.query.image_id;
        const loggedUser = req.loggedUser;
        const commentText = req.body.comment_text;

        if (!commentText || commentText.trim() === "") {
            return res.redirect('back');
        }

        const image = await Image.findById(imageId).exec();
        if (!image) {
            return res.render('info', { title: 'Błąd', messages: ['Obrazek nie istnieje!'] });
        }

        image.comments.push({
            text: commentText,
            author: loggedUser
        });

        await image.save();

        res.redirect(`/galleries/gallery_browse?gallery_id=${image.gallery}`);
    } catch (err) {
        next(err);
    }
};