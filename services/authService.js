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

exports.default = authorize;
