const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  bleID: String,
  gatewayID: String,
  connectionStatus: Boolean,
  connectedTo: String,
  timestamp: { type: Date, default: Date.now },
  id: String,
  connectionString: String,
  userAssign: String,
  secondLevelUserUid: String,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("gateway", UserSchema);
