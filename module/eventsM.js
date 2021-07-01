const mongoose = require("mongoose");
const eventsSchema = mongoose.Schema({
  Sensor_MAC_ID: String,
  Message: [
    {
      index: Number,
      Sensor_MAC_ID: String,
      sensorName: String,
      uid: String,
      title: String,
      body: String,
    },
  ],
});
const collectionName = "events";
module.exports = mongoose.model("events", eventsSchema, collectionName);
