const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  creationTime: String,
  displayName: String,
  email: String,
  lastSignTime: String,
  phoneNumber: String,
  photoURL: String,
  role: String,
  signInProvider: String,
  uid: String,
  id: String,
  user: String,
  address: String,
  timestamp: { type: Date, default: Date.now },
  //extra
  password: String,
  companyUid: String,
  gatewayList: [{ type: mongoose.Schema.ObjectId, ref: "gateway" }],
  secondUserLinkUid: String,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("user", UserSchema);
