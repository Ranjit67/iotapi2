const mongoose = require("mongoose");

const MachineSchema = mongoose.Schema({
  machineType: String,
  id: String,
  timestamp: { type: Date, default: Date.now },
});
MachineSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
module.exports = mongoose.model("machine", MachineSchema);
