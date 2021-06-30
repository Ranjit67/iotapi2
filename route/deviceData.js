const express = require("express");
const router = express.Router();
const DeviceData = require("../module/deviceDataM");
const createError = require("http-errors");
const { findOne } = require("../module/deviceDataM");

router.get("/", async (req, res, next) => {
  try {
    const findAllData = await DeviceData.find();
    res.json({ data: findAllData });
  } catch (error) {
    next(error);
  }
});
//find data through sensor macId
router.post("/getDataSensor", async (req, res, next) => {
  try {
    const { Sensor_MAC_ID } = req.body;
    if (!Sensor_MAC_ID)
      throw createError.BadRequest("Sensor mac id field are required...");
    const throughSensorMacId = await DeviceData.findOne({ Sensor_MAC_ID });
    res.json({ data: throughSensorMacId });
  } catch (error) {
    next(error);
  }
});

//get data between time period
router.post("/graphTime", async (req, res, next) => {
  try {
    const { sensorMacId, startTime, EndTime } = req.body;
    if (!sensorMacId || !startTime || !EndTime)
      throw createError.BadRequest("All data are important");
    const findDevice = await DeviceData.findOne({ Sensor_MAC_ID: sensorMacId });
    if (!findDevice)
      throw createError.NotFound("The sensor data is not found...");
    //data.slice(0,8)
    const tempArray = [];
    let count = 0;

    // await findDevice?.Message.forEach((element) => {});
    let start = findDevice?.Message.findIndex(
      (data) => data.TIME.slice(0, 8) == startTime
    );
    if (start < 0) {
      start = 0;
    }
    const endFalseDate = findDevice?.Message?.reverse()?.findIndex(
      (man) => man?.TIME?.slice(0, 8) === EndTime
    );
    const lengthArray = findDevice.Message.length;
    const finalEnd = lengthArray - (endFalseDate + 1);
    const finalData = findDevice.Message.splice(start, finalEnd - 1);
    res.json({
      start,
      // finalData,
      finalEnd,
      data: finalData,
      // data: findDevice.Message.length,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
