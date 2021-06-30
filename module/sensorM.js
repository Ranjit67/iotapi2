const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  IecStandard: String,
  frameSize: String,
  macID: String,
  machineType: String,
  maxVibration: String,
  powerConsumption: String,
  powerFactor: String,
  ratedCurrent: String,
  sensorName: String,
  speed: String,

  timestamp: { type: Date, default: Date.now },
  typeOfBearing: String,
  voltage: String,
  id: String,
  connectedTo: String,
  connectedGatewayMacId: String,
  connectionStatus: Boolean,
  connectedDeviceUid: String,
  connectedDeviceConfig: Object,
  frequency: String,
  threshold: Object,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("sensorM", UserSchema);
