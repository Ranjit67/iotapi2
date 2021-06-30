const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: String,
  location: String,
  name: String,
  password: String,
  uid: String,
  request: Boolean,
  timestamp: { type: Date, default: Date.now },
  devices: [
    {
      gateway: { type: mongoose.Schema.ObjectId, ref: "gateway" },

      sensor: [
        {
          verify: Boolean,
          sensorId: { type: mongoose.Schema.ObjectId, ref: "sensor" },
          dataConfig: Object,
        },
      ],
    },
  ],
  id: String,
  support: String,
});
UserSchema.pre("save", function (next) {
  this.id = this._id;
  next();
});
module.exports = mongoose.model("company", UserSchema);
