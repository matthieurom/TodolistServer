var mongoose = require("mongoose");
//Define structure of Todos :
var todoSchema = new mongoose.Schema({
  titre: String,
  description: String,
  done: Boolean
});

//Define structure of our Users :
var userSchema = new mongoose.Schema({
  login: String,
  password: String,
  todos: [todoSchema]
});

const Users = mongoose.model("Users", userSchema);

exports.default = Users;
