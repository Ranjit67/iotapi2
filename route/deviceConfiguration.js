const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const DeviceConfig = require("../module/deviceConfigurationM");
const Sensor = require("../module/sensorModify");
const Gateway = require("../module/gatewayM");
const { InternalServerError } = require("http-errors");

router.post("/create", async (req, res, next) => {
  try {
    const { sensorMacId, companyUid, dataConfig } = req.body;
    if (!sensorMacId || !companyUid) throw createError.BadRequest();

    const findSensor = await Sensor.findOne({ macID: sensorMacId });
    if (!findSensor) throw createError.NotFound("Sensor is not found...");

    // we got sensor and gateway details then operation
    const findCompanyDeviceConfig = await DeviceConfig.findOne({
      companyUid: companyUid,
      sensorMongooseId: findSensor.id,
    });
    if (findCompanyDeviceConfig) {
      const updateData = await DeviceConfig.findOneAndUpdate(
        { companyUid: companyUid, sensorMongooseId: findSensor.id },
        {
          dataConfig,
        },
        { useFindAndModify: false }
      );
      if (!updateData)
        throw InternalServerError("Something went wrong in update...");
      res.json({ data: "Update successful.." });
    } else {
      const deviceConfig = new DeviceConfig({
        sensorMongooseId: findSensor._id,
        dataConfig,
        companyUid,
      });
      const saver = await deviceConfig.save();
      if (!saver)
        throw createError.InternalServerError("Something went wrong..");
      res.json({ data: "Data save successfully..." });
    }
  } catch (error) {
    next(error);
  }
});
//find data through particuler sensor
router.post("/findSensor", async (req, res, next) => {
  try {
    const { uid, sensorMacId } = req.body;
    if (!uid || !sensorMacId)
      throw createError.BadRequest("All field are required..");
    const findSensor = await Sensor.findOne({ macID: sensorMacId });

    const findData = await DeviceConfig.find({
      sensorMongooseId: findSensor.id,
      companyUid: uid,
    });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});
//find all data
router.get("/:uid", async (req, res, next) => {
  try {
    const { uid } = req.params;
    if (!uid) throw createError.BadRequest();
    const findAll = await DeviceConfig.find({ companyUid: uid });
    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
