const express = require("express");
const { InternalServerError } = require("http-errors");
const router = express.Router();
const createError = require("http-errors");
const Parameters = require("../module/parametersM");
router.post("/create", async (req, res, next) => {
  try {
    const { name, objectData } = req.body;
    const check = await Parameters.findOne({
      parameters: { $elemMatch: { name } },
    });
    if (check) throw createError.Conflict("Name is already exit..");
    const findData = await Parameters.find();
    if (findData[0]) {
      const updateData = await Parameters.findOneAndUpdate(
        { _id: findData[0]._id },
        { $push: { parameters: { name: name, objectData: objectData } } },
        { useFindAndModify: false }
      );
      if (!updateData) throw createError.InternalServerError("data not save");
      res.json({ data: "data save" });
    } else {
      const parameters = new Parameters({
        parameters: [],
      });
      const saver = await parameters.save();
      if (!saver)
        throw createError.InternalServerError("Something went wrong..");
      //after save
      const updateDataAfterSave = await Parameters.findOneAndUpdate(
        { _id: saver._id },
        { $push: { parameters: { name: name, objectData: objectData } } },
        { useFindAndModify: false }
      );
      if (!updateDataAfterSave)
        throw createError.InternalServerError("data not save");
      res.json({ data: "data save" });
    }
  } catch (error) {
    next(error);
  }
});
//find all
router.get("/", async (req, res, next) => {
  try {
    const findData = await Parameters.find();
    res.json({ data: findData[0] });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
