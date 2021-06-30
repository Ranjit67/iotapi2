const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  Sensor_MAC_ID: String,
  IoTHubMessages: [
    {
      Sensor_MAC_ID: String,
      COMPANY_NAME: String,
      POLES: String,
      TIME: String,
      TYPE: String,
      EVENT: String,
      X: String,
      Y: String,
      Z: String,
      TEMP: String,
      Gateway_MAC_ID: String,
    },
  ],
  id: String,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
module.exports = mongoose.model("device", UserSchema);
