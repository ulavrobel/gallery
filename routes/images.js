var express = require('express');
var router = express.Router();
const imageController = require('../controllers/imageController');
const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Zarządzanie obrazkami oraz komentarzami
 */

/**
 * @swagger
 * /images/image_upload:
 *   get:
 *     summary: Formularz dodawania obrazka
 *     tags: [Images]
 *     description: Formularz uploadu zdjęcia do galerii.
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Wgrywa nowy obrazek
 *     tags: [Images]
 *     description: Zapisuje plik graficzny i jego dane.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa obrazka
 *               description:
 *                 type: string
 *                 description: Opis obrazka
 *               gallery:
 *                 type: string
 *                 description: ID galerii
 *               imageFile:
 *                 type: string
 *                 format: binary
 *                 description: Plik .jpg lub .png
 *     responses:
 *       302:
 *         description: Przekierowanie po sukcesie.
 */
router.get("/image_upload", authenticate, imageController.getImageUpload);
router.post("/image_upload", authenticate, imageController.postImageUpload);

/**
 * @swagger
 * /images/image_delete:
 *   get:
 *     summary: Usuwa obrazek
 *     tags: [Images]
 *     description: Usuwa wpis i plik z dysku.
 *     parameters:
 *       - in: query
 *         name: image_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID obrazka
 *     responses:
 *       302:
 *         description: Przekierowanie do galerii.
 */
router.get("/image_delete", authenticate, imageController.getImageDelete);

/**
 * @swagger
 * /images/image_update:
 *   get:
 *     summary: Formularz edycji obrazka
 *     tags: [Images]
 *     description: Formularz z danymi obrazka do edycji.
 *     parameters:
 *       - in: query
 *         name: image_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID obrazka
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Zapisuje zmiany w obrazku
 *     tags: [Images]
 *     description: Aktualizuje nazwę, opis lub galerię.
 *     parameters:
 *       - in: query
 *         name: image_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID obrazka
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               i_name:
 *                 type: string
 *                 description: Nowa nazwa
 *               i_description:
 *                 type: string
 *                 description: Nowy opis
 *               i_gallery:
 *                 type: string
 *                 description: Nowe ID galerii
 *     responses:
 *       302:
 *         description: Przekierowanie po edycji.
 */
router.get("/image_update", authenticate, imageController.getImageUpdate);
router.post("/image_update", authenticate, imageController.postImageUpdate);

/**
 * @swagger
 * /images/image_comment:
 *   post:
 *     summary: Dodaje komentarz do obrazka
 *     tags: [Images]
 *     description: Dopisuje komentarz do zdjęcia.
 *     parameters:
 *       - in: query
 *         name: image_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID obrazka
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               comment_text:
 *                 type: string
 *                 description: Treść komentarza
 *     responses:
 *       302:
 *         description: Odświeżenie strony.
 */
router.post("/image_comment", authenticate, imageController.postImageComment);

module.exports = router;