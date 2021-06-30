const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  macID: String,
  sensorName: String,
  sensorData: Object,
  timestamp: { type: Date, default: Date.now },
  id: String,
  connectedTo: String,
  connectedGatewayMacId: String,
  connectionStatus: Boolean,
  connectedDeviceUid: String,
  connectedDeviceConfig: Object,
  threshold: Object,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});

module.exports = mongoose.model("sensor", UserSchema);
