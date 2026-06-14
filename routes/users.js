var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate'); 
const isAdmin = require('../middleware/isAdmin'); 

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Zarządzanie użytkownikami, uwierzytelnianie i autoryzacja
 */

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Ścieżka testowa
 *     tags: [Users]
 *     description: Prosta odpowiedź tekstowa.
 *     responses:
 *       200:
 *         description: Sukces
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * @swagger
 * /users/user_add:
 *   get:
 *     summary: Formularz dodawania użytkownika (Admin)
 *     tags: [Users]
 *     description: Formularz tworzenia konta.
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Tworzy nowego użytkownika (Admin)
 *     tags: [Users]
 *     description: Rejestruje użytkownika i szyfruje hasło.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: Imię
 *               last_name:
 *                 type: string
 *                 description: Nazwisko
 *               username:
 *                 type: string
 *                 description: Login
 *               password:
 *                 type: string
 *                 description: Hasło (min. 8 znaków)
 *     responses:
 *       200:
 *         description: Sukces lub błąd walidacji.
 */
router.get("/user_add", authenticate, isAdmin, userController.getUserAdd);
router.post("/user_add", authenticate, isAdmin, userController.postUserAdd);

/**
 * @swagger
 * /users/user_login:
 *   get:
 *     summary: Formularz logowania
 *     tags: [Users]
 *     description: Formularz loginu i hasła.
 *     responses:
 *       200:
 *         description: Sukces.
 *   post:
 *     summary: Loguje użytkownika
 *     tags: [Users]
 *     description: Weryfikuje dane i ustawia cookie JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Login
 *               password:
 *                 type: string
 *                 description: Hasło
 *     responses:
 *       302:
 *         description: Przekierowanie na stronę główną.
 */
router.get("/user_login", userController.getUserLogin);
router.post("/user_login", userController.postUserLogin);

/**
 * @swagger
 * /users/user_logout:
 *   get:
 *     summary: Wylogowuje użytkownika
 *     tags: [Users]
 *     description: Czyści cookie JWT i sesję.
 *     responses:
 *       302:
 *         description: Przekierowanie na stronę główną.
 */
router.get("/user_logout", userController.getUserLogout);

/**
 * @swagger
 * /users/user_list:
 *   get:
 *     summary: Lista użytkowników (Admin)
 *     tags: [Users]
 *     description: Lista wszystkich kont.
 *     responses:
 *       200:
 *         description: Sukces.
 *       403:
 *         description: Brak uprawnień.
 */
router.get("/user_list", authenticate, isAdmin, userController.getUserList);

/**
 * @swagger
 * /users/user_delete:
 *   get:
 *     summary: Usuwa użytkownika (Admin)
 *     tags: [Users]
 *     description: Usuwa konto z bazy danych.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID użytkownika
 *     responses:
 *       302:
 *         description: Przekierowanie do listy.
 */
router.get("/user_delete", authenticate, isAdmin, userController.getUserDelete);

module.exports = router;