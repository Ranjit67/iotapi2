const express = require("express");
const router = express.Router();
const Event = require("../module/eventsM");
router.get("/:macID", async (req, res, next) => {
  try {
    const { macID } = req.params;

    const findData = await Event.findOne({ Sensor_MAC_ID: macID });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
