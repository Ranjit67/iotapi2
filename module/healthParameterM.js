const mongoose = require("mongoose");

const healthParameterSchema = mongoose.Schema({
  Sensor_MAC_ID: String,
  Message: [
    {
      index: Number,
      overall_Vibration: Number,
      bearing_condition: Number,
      skin_temperature: Number,
      x_vibration: Number,
      y_vibration: Number,
      z_vibration: Number,
      speed: Number,
      number_of_starts: Number,
      frequency: Number,
      output_power: Number,
      total_running_time: Number,
      Sensor_MAC_ID: String,
    },
  ],
});
// healthParameterSchema.pre("save", function (next) {
//   next();
// });
const collectionName = "health_parameters";
module.exports = mongoose.model(
  "health_parameters",
  healthParameterSchema,
  collectionName
);
