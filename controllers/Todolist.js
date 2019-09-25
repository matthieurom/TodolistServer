var Todos = require("../models/TodoModel").default;
var User = require("../models/UserModel").default;
var jwt = require("jsonwebtoken");

async function authorize(req) {
  try {
    //Récupératon du token
    var token = req.headers.authorization.replace("Bearer ", "");
    //Vérfication du token en utilisant le code "secret" défini dans la création du token
    var tokenDecoded = jwt.verify(token, "secret");
    var query = User.where({
      _id: tokenDecoded
    });
    //await permet d'attendre que findOne trouve un user correspondant au token
    const user = await query.findOne();
    //Si user est undefined (token non correct ou l'_id ne correspond pas à une _id de la db) alors on throw une nouvelle error
    if (user === undefined) {
      throw new Error();
    }
    //Si on catch un erreur on retourne false
  } catch {
    return false;
  }
  //Everythink works
  req.userId = tokenDecoded; // on imbrique le token décodé dans userId
  return true;
}

const authorizeMiddleware = async (req, res, next) => {
  const isAuthorized = await authorize(req);
  if (!isAuthorized) {
    return res.status(403).send("Unauthorized");
  }

  next();
};

function todolistController(app) {
  app
    // RECUPERER TOUTES LES TODO D'UN UTILISATEUR //
    .get("/todo", authorizeMiddleware, async (req, res) => {
      var query = User.where({ _id: req.userId }); // on récupère l'utilisateur concerné
      const user = await query.findOne();
      if (user) {
        return res.json(user.todos);
      } else {
        return res.status(404).send("Bad Request, undefined todo");
      }
    })

    // RECUPERER UNE TODO D'UN UTILISATEUR //
    .get("/todo/:id", async (req, res) => {
      // Ici l'utilisaton d'une const isAuthorized revient au meme que d'utiliser le middleware créé pour vérifier le token
      const isAuthorized = await authorize(req);
      if (!isAuthorized) {
        return res.status(403).send("Unauthorized");
      }
      var query = User.where({ _id: req.userId }); // on récupère l'user concerné
      const user = await query.findOne();
      // Vérfication de l'existence du todo
      if (user) {
        // Filtrage des todo en retirant le todo passé en param
        const todoFound = user.todos.find(todo => todo._id == req.params.id);
        //Mise à jour du user
        return res.json(todoFound);
      }
    })

    // AJOUTER UN TODO A UN UTILISATEUR EXISTANT //
    .post("/todo", authorizeMiddleware, async (req, res) => {
      var newTodo = new Todos({
        titre: req.body.titre,
        description: req.body.description,
        done: req.body.done
      });
      var query = User.where({ _id: req.userId });
      query.findOne(function(err, user) {
        if (err) return res.status(500).send("Error 500");
        //Verification de l'existence du user
        if (user) {
          user.todos.push(newTodo);
          user.save();
          res.json(user);
        } else {
          return res.status(404).send("Not found");
        }
      });
    })

    // MODIFIER UN TODO EXISTANT //
    .patch("/todo/:id", authorizeMiddleware, async (req, res) => {
      var query = User.where({ _id: req.userId }); // on récupère les todo avec le parametre entré dans l'url
      query.findOne(function(err, user) {
        if (err) return res.status(500).send("Error: 500");
        // Vérfication de l'existence du todo
        if (user != undefined) {
          user.todos.map(todo => {
            // Vérifie que l'id entré en parametre correspond à un id d'un todo
            if (todo._id == req.params.id) {
              if (req.body.titre != undefined) todo["titre"] = req.body.titre;
              if (req.body.description != undefined)
                todo["description"] = req.body.description;
              if (req.body.done != undefined) todo["done"] = req.body.done;
            }
          });
          // Save modifications
          user.save();
          return res.json(user);
        } else {
          return res.status(404).send("Bad Request, undefined todo");
        }
      });
    })

    // SUPPRIMER UN TODO EXISTANT //
    .patch("/todo/delete/:id", authorizeMiddleware, async (req, res) => {
      var query = User.where({ _id: req.userId }); // on récupère l'utilisateur concerné
      const user = await query.findOne();
      // Vérfication de l'existence du todo
      if (user != undefined) {
        // Filtrage des todo en retirant le todo passé en param
        const filteredTodos = user.todos.filter(
          todo => todo._id != req.params.id
        );
        //Mise à jour du user
        user["todos"] = filteredTodos;
        // Save modifications
        user.save();
        return res.json(user);
      } else {
        return res.status(404).send("Bad Request, undefined todo");
      }
    });
}

exports.default = todolistController;
