var mongoose = require("mongoose");

// Define structure of our Todos
var todoSchema = new mongoose.Schema({
  titre: String,
  description: String,
  done: Boolean
});

const Todos = mongoose.model("Todos", todoSchema);

exports.default = Todos;
