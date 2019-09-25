var Users = require("../models/UserModel").default;
var jwt = require("jsonwebtoken");
var md5 = require("md5");

function userController(app) {
  app
    //Créer un utilisateur
    .post("/register", (req, res) => {
      var newUser = new Users({
        login: req.body.login,
        password: md5(req.body.password) //password crypté
      });
      newUser.save();
      res.json(newUser);
    })
    // Récupérer tous les utilisateurs
    .get("/user", (req, res) => {
      Users.find((err, users) => {
        if (err) return res.status(500).send("Error: Bad 500");
        return res.json(users);
      });
    })

    // Récupérer un utilisateur depuis son id
    .get("/user/:id", (req, res) => {
      var query = Users.where({ _id: req.params.id }); // on récupère les todo avec le parametre entré dans l'url
      query.findOne(function(err, user) {
        if (err) return res.status(500).send("Error: Bad 500");
        return user === undefined // si todo est non défini (l'id n'existe pas) alors on envoie error 404 sinon on retourne le json
          ? res.status(404).send("Bad Request")
          : res.json(user);
      });
    })

    //Générer un token depuis un utilisateur connu de la db
    .post("/login", (req, res) => {
      var query = Users.where({
        login: req.body.login,
        password: md5(req.body.password)
      });
      query.findOne(function(err, user) {
        if (err) return res.status(500).send("Error 500");
        if (!user) {
          return res.status(404).send("Bad Request");
        } else {
          return res.send(jwt.sign({ _id: user._id }, "secret"));
        }
      });
    });
}

exports.default = userController;
