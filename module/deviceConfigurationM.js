const mongoose = require("mongoose");
// const Sensor = require("./sensorM");
// const Gateway = require("./gatewayM");
const DeviceConfigurationSchema = mongoose.Schema({
  sensorMongooseId: { type: mongoose.Schema.ObjectId, ref: "sensor" },
  companyUid: String,
  dataConfig: Object,
  id: String,
});
DeviceConfigurationSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("deviceConfig", DeviceConfigurationSchema);
