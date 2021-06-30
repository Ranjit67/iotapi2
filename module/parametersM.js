const mongoose = require("mongoose");

const ParametersSchema = mongoose.Schema({
  parameters: [{ name: String, objectData: Object }],
  id: String,
  timestamp: { type: Date, default: Date.now },
});
ParametersSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("parameter", ParametersSchema);
