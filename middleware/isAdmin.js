const isAdmin = (req, res, next) => {

    if (req.loggedUser && req.loggedUser === "admin") {
      next(); 
    } else {
      res.render("info", { 
        title: "Odmowa dostępu", 
        messages: ["Dostęp zablokowany. Akcja wymaga uprawnień administratora!"] 
      });
    }
  }
  
  module.exports = isAdmin;