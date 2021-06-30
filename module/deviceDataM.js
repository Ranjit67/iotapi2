const mongoose = require("mongoose");

const DeviceDataSchema = mongoose.Schema({
  Sensor_MAC_ID: String,
  Message: [
    {
      index: Number,
      Sensor_MAC_ID: String,
      COMPANY_NAME: String,
      SPEED: Number,
      TIME: String,
      TYPE: String,
      EVENT: Number,
      XAXIS: Array,
      YAXIS: Array,
      ZAXIS: Array,
      OVERALLVIB: Array,
      TEMP: Number,
      Gateway_MAC_ID: String,
      POWER_FACTOR: Number,
      FREQUENCY: Number,
      BEARING_CONDITION: Array,
      TOTAL_RUNNING_TIME: Number,
      NUMBER_OF_STARTS: Number,
      PREDICT_V: Array,
      PREDICT_M: String,
    },
  ],
  id: String,
});

DeviceDataSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
const collectionName = "deviceData";
module.exports = mongoose.model("deviceData", DeviceDataSchema, collectionName);
// var schema = new Schema({ name: String }, { collection: 'actor' });
// mongoose.model('Actor', schema, collectionName)
