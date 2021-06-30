const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Gateway = require("../module/gatewayM");
const Company = require("../module/companyM");
const Sensor = require("../module/sensorM");
router.post("/create", async (req, res, next) => {
  try {
    const { bleID, gatewayID, connectionString } = req.body;
    if (!bleID || !gatewayID || !connectionString)
      throw createError.BadRequest("Each field has to be required..");
    const dataFind = await Gateway.findOne({ gatewayID });
    if (dataFind) throw createError.Conflict("This data is already registered");
    const gateway = new Gateway({
      bleID,
      gatewayID,
      connectionString,
      connectionStatus: false,
    });
    const saver = gateway.save();
    if (!saver) throw createError.BadGateway("Something went wrong....");
    res.json({ data: "Data is save successfully..." });
  } catch (error) {
    next(error);
  }
});

//find all gateway
router.get("/", async (req, res, next) => {
  try {
    const findAll = await Gateway.find();

    res.send({ data: findAll.reverse() });
  } catch (error) {
    next(error);
  }
});
// check gateway have how many sensors
router.post("/check/gatewaySensor", async (req, res, next) => {
  try {
    const { gatewayMacId } = req.body;
    if (!gatewayMacId) throw createError.BadRequest("You cant leave empty...");
    const gatewayData = await Gateway.findOne({ gatewayID: gatewayMacId });
    if (!gatewayData) throw createError.NotFound("The gateway is not found..");
    const findData = await Company.findOne({
      devices: { $elemMatch: { gateway: gatewayData._id } },
    }).populate("devices.sensor.sensorId");
    if (!findData)
      throw createError.NotFound(
        "The gateway is not connected to any sensors...."
      );
    res.send({
      data: findData.devices.find((id) => id.gateway == gatewayData.id),
    });
  } catch (error) {
    next(error);
  }
});
// find all active device
router.get("/active", async (req, res, next) => {
  try {
    const active = await Gateway.find({ connectionStatus: true });
    res.json({ data: active });
  } catch (error) {
    next(error);
  }
});
//delete gateway
router.delete("/delete", async (req, res, next) => {
  try {
    const { gatewayMacId } = req.body;
    if (!gatewayMacId) throw createError.BadRequest();
    const findGateway = await Gateway.findOne({ gatewayID: gatewayMacId });
    if (!findGateway) throw createError.NotFound("Gateway is not found..");
    if (findGateway.connectedTo) {
      const updateCompany = await Company.findOneAndUpdate(
        { uid: findGateway.connectedTo },
        { $pull: { devices: { gateway: findGateway.id } } },
        { useFindAndModify: false }
      );

      if (!updateCompany) throw createError.Conflict("Something not good.");
    }
    //remove from sensor
    const updateSensor = await Sensor.updateMany(
      {
        connectedGatewayMacId: findGateway.gatewayID,
        connectedTo: findGateway.connectedTo,
      },
      {
        connectedGatewayMacId: null,
        connectedTo: null,
        connectionStatus: false,
      }
    );

    if (!updateSensor)
      throw createError.InternalServerError("Something went wrong..");
    const deleteGateway = await Gateway.findOneAndDelete({
      gatewayID: gatewayMacId,
    });
    if (!deleteGateway)
      throw createError.InternalServerError("Something went wrong");
    res.json({ data: "Data deleted successfully ...." });
  } catch (error) {
    next(error);
  }
});
//delete gateway end
//get gateway through company uid
router.post("/gatewayFindCompany", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest();
    const listGateway = await Gateway.find({ connectedTo: uid });
    res.json({ data: listGateway });
  } catch (error) {
    next(error);
  }
});
//end
// find gateway through gateway mac id
router.get("/:macId", async (req, res, next) => {
  try {
    const { macId } = req.params;
    const findData = await Gateway.findOne({ gatewayID: macId });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
