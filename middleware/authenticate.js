const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.mytoken;
    
    if (!token) {
      return res.render("info", { title: "Info", messages: ['Musisz być zalogowany!'] });
    }

    const decode = jwt.verify(token, 'e4b9c1d5-8f3a-4e2b-9d7c-1a2b3c4d5e6f');

    req.user = decode;
    req.loggedUser = req.user.username;
    next();
  } catch (err) {
    res.render("info", { title: "Info", messages: ['Musisz być zalogowany!'] });
  }
}

module.exports = authenticate;