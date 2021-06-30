const mongoose = require("mongoose");

const CompanyUserSchema = mongoose.Schema({
  email: String,
  password: String,
  id: String,
  timestamp: { type: Date, default: Date.now },
  uid: String,
  companyUid: String,
  gatewayList: [{ type: mongoose.Schema.ObjectId, ref: "gateway" }],
  role: String,
  secondUserLinkUid: String,
});
CompanyUserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
module.exports = mongoose.model("companyUser", CompanyUserSchema);
