const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Machine = require("../module/machineM");
router.post("/create", async (req, res, next) => {
  try {
    const { machineType } = req.body;
    if (!machineType)
      throw createError.BadRequest("You can not leave empty space ..");
    const machine = new Machine({
      machineType,
    });
    const saver = await machine.save();
    if (!saver)
      throw createError.InternalServerError("Something went wrong...");
    res.json({ data: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const findAll = await Machine.find();

    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
//get machine through id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const machineData = await Machine.findOne({ id });
    res.json({ data: machineData });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
