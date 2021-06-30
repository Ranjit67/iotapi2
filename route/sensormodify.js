const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Sensor = require("../module/sensorModify");
const Company = require("../module/companyM");
const Gateway = require("../module/gatewayM");

router.post("/create", async (req, res, next) => {
  try {
    const { macID, sensorName, sensorData, threshold } = req.body;
    if (!macID || !sensorName)
      throw createError.BadRequest("Mac id and sensor name are required...");
    const findSensor = await Sensor.findOne({ macID });
    if (findSensor) throw createError.Conflict("This sensor already exit...");
    const sensor = new Sensor({
      macID,
      sensorName,
      sensorData,
      threshold,
      connectionStatus: false,
    });
    const saver = await sensor.save();
    if (!saver) throw createError.ServiceUnavailable("Something went wrong...");
    res.json({ data: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});
//find all sensor
router.get("/", async (req, res, next) => {
  try {
    const findAll = await Sensor.find();
    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
//sensor delete end
router.post("/delete", async (req, res, next) => {
  try {
    const { sensorMacId } = req.body;
    if (!sensorMacId) throw BadRequest("All field are required...");
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

//find all device belong to company
router.post("/sensorCompany", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest("Uuid is required field...");
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
module.exports = router;
