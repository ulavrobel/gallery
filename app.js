const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
var imagesRouter = require('./routes/images');
var mongoose = require('mongoose');
var User = require('./models/user'); 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var galleriesRouter = require('./routes/galleries');
var app = express();

const mongoDB = 'mongodb://127.0.0.1:27017/gallery';
mongoose.connect(mongoDB)
  .then(async () => {
    console.log('Udało się połączyć z bazą MongoDB!');

    try {
      const userCount = await User.countDocuments();
      
      const passwordHash = await bcrypt.hash("admin", 10);

      if (userCount === 0) {
        console.log('Brak użytkowników w bazie.');
        const defaultAdmin = new User({
          username: 'admin',
          password: passwordHash
        });
        
        await defaultAdmin.save();
        console.log('Konto "admin" z hasłem "admin" zostało pomyślnie utworzone.');
      }
    } catch (dbErr) {
      console.error('Błąd podczas inicjalizacji konta administratora:', dbErr);
    }
  })
  .catch((err) => console.error('Błąd połączenia z bazą MongoDB:', err));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gallery API',
      version: '1.0.0',
      description: 'Dokumentacja API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const JWT_SECRET = 'e4b9c1d5-8f3a-4e2b-9d7c-1a2b3c4d5e6f';

const jwt = require("jsonwebtoken");
app.use((req, res, next) => {
  const token = req.cookies.mytoken;
  if (token) {
    try {
      res.locals.loggedUser = jwt.verify(token, JWT_SECRET).username;
    } catch (e) {
      res.locals.loggedUser = null;
    }
  } else {
    res.locals.loggedUser = null;
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/galleries', galleriesRouter);
app.use('/images', imagesRouter);
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;