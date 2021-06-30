const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const mongoose = require("mongoose");

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }

  next();
});

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
//route section
app.get("/", (req, res) => {
  res.send("Data is send by me....");
});

//azure == device
const Device = require("./route/device");
app.use("/devices", Device);
//Sensor
// const Sensor = require("./route/sensor");
// app.use("/sensors", Sensor);
//modify sensor
const modifySensor = require("./route/sensormodify");
app.use("/sensors", modifySensor);
//gateway
const Gateway = require("./route/gateway");
app.use("/gateways", Gateway);
//company
const Company = require("./route/company");
app.use("/companies", Company);
//user
const User = require("./route/user");
app.use("/users", User);
const RequestCompany = require("./route/requestCompany");
app.use("/requested-companies", RequestCompany);
const Machine = require("./route/machine");
app.use("/machines", Machine);
const DeviceConfig = require("./route/deviceConfiguration");
app.use("/deviceConfig", DeviceConfig);
const Parameter = require("./route/parameter");
app.use("/parameter", Parameter);
// const CompanyDevice = require("./")
const Mail = require("./route/mail");
app.use("/mail", Mail);
const DeviceData = require("./route/deviceData");
app.use("/DeviceData", DeviceData);
const heathParameterData = require("./route/healthParameter");
app.use("/healthParameterData", heathParameterData);
//company user
const companyUser = require("./route/companyUser");
app.use("/companyUser", companyUser);
//second level user of companyUser
const secondLevel = require("./route/SecondLevelUserCompany");
app.use("/secondLevelUser", secondLevel);
//
//route section end

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("The port 4000 is ready to start...");
});
