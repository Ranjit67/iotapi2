const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Sensor = require("../module/sensorM");
const Company = require("../module/companyM");
const Gateway = require("../module/gatewayM");
const { BadRequest } = require("http-errors");
const { findOneAndDelete } = require("../module/sensorM");
router.post("/create", async (req, res, next) => {
  try {
    const {
      IecStandard,
      frameSize,
      macID,
      machineType,
      maxVibration,
      powerConsumption,
      powerFactor,
      ratedCurrent,
      sensorName,
      speed,
      typeOfBearing,
      voltage,
      frequency,
      threshold,
    } = req.body;
    if (
      !IecStandard ||
      !frameSize ||
      !macID ||
      !machineType ||
      !maxVibration ||
      !powerConsumption ||
      !powerFactor ||
      !ratedCurrent ||
      !sensorName ||
      !speed ||
      !typeOfBearing ||
      !voltage ||
      !frequency
    )
      throw createError.BadRequest("You can't leave empty any single field..");
    const check = await Sensor.findOne({ macID });
    if (check) throw createError.Conflict("This sensor is already exit...");
    const sensor = new Sensor({
      IecStandard,
      frameSize,
      macID,
      machineType,
      maxVibration,
      powerConsumption,
      powerFactor,
      ratedCurrent,
      sensorName,
      speed,
      typeOfBearing,
      connectionStatus: false,
      voltage,
      frequency,
      threshold,
    });
    const saver = sensor.save();
    if (!saver) throw createError.ServiceUnavailable("Something went wrong...");
    res.json({ data: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});

//find all sensor
router.get("/", async (req, res, next) => {
  try {
    const findAllCompanies = await Sensor.find();

    res.json({ data: findAllCompanies.reverse() });
  } catch (error) {
    next(error);
  }
});
// sensor delete

//sensor delete end
router.post("/delete", async (req, res, next) => {
  try {
    const { sensorMacId } = req.body;
    if (!sensorMacId) throw BadRequest();
    const findSensor = await Sensor.findOne({ macID: sensorMacId });
    if (!findSensor) throw createError.NotFound("The sensor is not found..");
    if (findSensor.connectionStatus) {
      const gatewayFind = await Gateway.findOne({
        gatewayID: findSensor.connectedGatewayMacId,
      });

      if (!gatewayFind)
        throw createError.InternalServerError(
          "Something went wrong in gateway find..."
        );
      if (findSensor.connectedGatewayMacId) {
        const updateFromCompany = await Company.findOneAndUpdate(
          {
            uid: findSensor.connectedTo,
            devices: { $elemMatch: { gateway: gatewayFind.id } },
          },
          { $pull: { "devices.$.sensor": { sensorId: findSensor.id } } },
          { useFindAndModify: false }
        );
        if (!updateFromCompany)
          throw createError.GatewayTimeout("Not updated company..");
        const sensorDelete = await Sensor.findOneAndDelete({
          macID: sensorMacId,
        });
        if (!sensorDelete)
          throw createError.InternalServerError(
            "Something went wrong in sensor data.."
          );
        res.json({ data: "Data deleted successfully..." });
      } else {
        const deleteSensor = await Sensor.findOneAndDelete({
          macID: sensorMacId,
        });
        if (!deleteSensor)
          throw createError.InternalServerError(
            "Something went wrong sensor delete..."
          );
        res.json({ data: "Sensor is deleted successfully.." });
      }
    } else {
      //if it does not have connected with any one
      const deleteSensor = await Sensor.findOneAndDelete({
        macID: sensorMacId,
      });
      if (!deleteSensor)
        throw createError.InternalServerError(
          "Something went wrong sensor delete..."
        );
      res.json({ data: "Sensor is deleted successfully.." });
    }
  } catch (error) {
    next(error);
  }
});
//find individual company exited field
router.post("/companyExitedDevice", async (req, res, next) => {
  try {
    const { companyUid } = req.body;
    const findData = await Sensor.find({
      connectedTo: companyUid,
      connectedDeviceUid: { $exists: true },
    });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});
//check all exit field
router.get("/exitDevice", async (req, res, next) => {
  try {
    const findData = await Sensor.find({
      connectedDeviceUid: { $exists: true },
    });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});

// find sensor through cmpany uid
router.post("/sensorCompany", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest();
    const findCompanySensor = await Sensor.find({ connectedTo: uid });
    res.json({ data: findCompanySensor });
  } catch (error) {
    next(error);
  }
});
//threshold update
router.put("/threshold/update", async (req, res, next) => {
  try {
    const { macID, threshold } = req.body;
    if (!macID) throw createError.BadRequest("All field are required...");
    const updateThreshold = await Sensor.findOneAndUpdate(
      { macID },
      { threshold },
      { useFindAndModify: false }
    );
    if (!updateThreshold)
      throw createError.GatewayTimeout("Something went wrong...");
    res.send({ data: "Threshold updated...." });
  } catch (error) {
    next(error);
  }
});
//find sensor through gateway mac id
router.post("/gatewayUnderSensor", async (req, res, next) => {
  try {
    const { gatewayMacId } = req.body;
    if (!gatewayMacId)
      throw createError.BadRequest("Gateway mac id is important field...");
    const findSensors = await Sensor.find({
      connectedGatewayMacId: gatewayMacId,
    });
    res.json({ data: findSensors });
  } catch (error) {
    next(error);
  }
});
// find data through sensor mac id

router.get("/:macID", async (req, res, next) => {
  try {
    const { macID } = req.params;
    const findData = await Sensor.findOne({ macID });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});

//

module.exports = router;
