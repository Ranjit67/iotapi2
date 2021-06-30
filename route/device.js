const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Devices = require("../module/deviceM");

router.get("/", async (req, res, next) => {
  try {
    const findAll = await Devices.find();
    res.json({ data: findAll.reverse() });
  } catch (error) {
    next(error);
  }
});
// get devices details through sensor Mac id
router.post("/devices/Sensor", async (req, res, next) => {
  try {
    const { sensorMacId } = req.body;
    if (!sensorMacId)
      throw createError.BadRequest("you can not leave empty...");
    const findDevice = await Devices.findOne({ Sensor_MAC_ID: sensorMacId });
    res.json({ data: findDevice });
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
    const findDevice = await Devices.findOne({ Sensor_MAC_ID: sensorMacId });
    if (!findDevice)
      throw createError.NotFound("The sensor data is not found...");
    //data.slice(0,8)
    // const tempArray =[]
    const start = findDevice?.IoTHubMessages?.findIndex(
      (man) => man?.TIME?.slice(0, 8) === startTime
    );
    const endFalseDate = findDevice?.IoTHubMessages?.reverse()?.findIndex(
      (man) => man?.TIME?.slice(0, 8) === EndTime
    );
    // const lengthArray = findDevice?.IoTHubMessages?.length;
    // const finalEnd = lengthArray - (endFalseDate + 1);
    let temp = findDevice?.IoTHubMessages;
    temp?.splice(0, start + 1);
    // temp?.reverse()?.splice(0, endFalseDate + 1);
    // const finalData = findDevice?.IoTHubMessages?.splice(start, finalEnd - 1);
    res.json({
      start: start,
      falseEnd: endFalseDate,
      data: findDevice?.IoTHubMessages[findDevice?.IoTHubMessages?.length - 1],
    });
  } catch (error) {
    next(error);
  }
});
//
router.get("/:macId", async (req, res, next) => {
  try {
    const { macId } = req.params;
    const findDta = await Devices.findOne({ Sensor_MAC_ID: macId });
    res.json({ data: findDta });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
