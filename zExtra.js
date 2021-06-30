const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Vdeal:MlojNzL6oFQp8g9c@cluster0.ygg7l.mongodb.net/VodealDB?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.connection.on("connected", () => {
  console.log("The data base is connected.");
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});

const UserSchema = mongoose.Schema({
  Sensor_MAC_ID: String,
  IoTHubMessages: [
    {
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
