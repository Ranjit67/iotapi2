const express = require("express");
const router = express.Router();
const HealthParameter = require("../module/healthParameterM");

// find healthParameter Data through sensor mac id

router.get("/:macID", async (req, res, next) => {
  try {
    const { macID } = req.params;

    const findData = await HealthParameter.findOne({ Sensor_MAC_ID: macID });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});
// router.post('/create',async(req,res,next)=>{
//   try {
//     const healthParameter=new HealthParameter {
//       Sensor_MAC_ID:
//     }
//   } catch (error) {
//     next(error)
//   }
// })
module.exports = router;
