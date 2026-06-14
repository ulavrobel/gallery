var express = require('express');
var router = express.Router();
const galleryController = require('../controllers/galleryController'); 
const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Galleries
 *   description: Zarządzanie galeriami i ich ustawieniami
 */

/**
 * @swagger
 * /galleries:
 *   get:
 *     summary: Pobiera listę wszystkich galerii
 *     tags: [Galleries]
 *     description: Lista galerii użytkownika lub wszystkich (admin).
 *     responses:
 *       200:
 *         description: Sukces.
 *       401:
 *         description: Niezalogowany.
 */
router.get("/", authenticate, galleryController.getGalleryList);

/**
 * @swagger
 * /galleries/gallery_add:
 *   get:
 *     summary: Formularz dodawania galerii
 *     tags: [Galleries]
 *     description: Formularz tworzenia nowej galerii.
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Tworzy nową galerię
 *     tags: [Galleries]
 *     description: Zapisuje nową galerię w bazie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               g_name:
 *                 type: string
 *                 description: Nazwa galerii
 *               g_description:
 *                 type: string
 *                 description: Opis galerii
 *     responses:
 *       302:
 *         description: Przekierowanie do listy galerii.
 */
router.get("/gallery_add", authenticate, galleryController.getGalleryAdd);
router.post("/gallery_add", authenticate, galleryController.postGalleryAdd);

/**
 * @swagger
 * /galleries/gallery_browse:
 *   get:
 *     summary: Przeglądanie zawartości galerii
 *     tags: [Galleries]
 *     description: Widok miniatur obrazków w galerii.
 *     parameters:
 *       - in: query
 *         name: gallery_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID galerii
 *     responses:
 *       200:
 *         description: Sukces.
 */
router.get("/gallery_browse", authenticate, galleryController.getGalleryBrowse);

/**
 * @swagger
 * /galleries/gallery_delete:
 *   get:
 *     summary: Usuwa pustą galerię
 *     tags: [Galleries]
 *     description: Usuwa galerię bez zdjęć (wymaga uprawnień).
 *     parameters:
 *       - in: query
 *         name: gallery_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID galerii
 *     responses:
 *       302:
 *         description: Przekierowanie po usunięciu.
 */
router.get("/gallery_delete", authenticate, galleryController.getGalleryDelete);

/**
 * @swagger
 * /galleries/gallery_update:
 *   get:
 *     summary: Formularz edycji galerii
 *     tags: [Galleries]
 *     description: Formularz z danymi galerii do edycji.
 *     parameters:
 *       - in: query
 *         name: gallery_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID galerii
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Zapisuje zmiany w galerii
 *     tags: [Galleries]
 *     description: Aktualizuje dane galerii.
 *     parameters:
 *       - in: query
 *         name: gallery_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID galerii
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               g_name:
 *                 type: string
 *                 description: Nowa nazwa galerii
 *               g_description:
 *                 type: string
 *                 description: Nowy opis galerii
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu.
 */
router.get("/gallery_update", authenticate, galleryController.getGalleryUpdate);
router.post("/gallery_update", authenticate, galleryController.postGalleryUpdate);

module.exports = router;