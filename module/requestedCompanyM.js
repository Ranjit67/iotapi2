const mongoose = require("mongoose");

const requestCompanySchema = mongoose.Schema({
  email: String,
  location: String,
  name: String,
  password: String,
  uid: String,
  id: String,
  timestamp: { type: Date, default: Date.now },
});
requestCompanySchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
module.exports = mongoose.model("requestCompany", requestCompanySchema);
