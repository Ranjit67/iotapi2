const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const RequestCompany = require("../module/requestedCompanyM");
const Company = require("../module/companyM");
router.post("/create", async (req, res, next) => {
  try {
    const { email, location, name, password, uid } = req.body;
    if (!email || !location || !name || !password || !uid)
      throw createError.BadRequest();
    const requestCompany = new RequestCompany({
      email,
      location,
      name,
      password,
      uid,
    });

    const saver = await requestCompany.save();
    if (!saver)
      throw createError.InternalServerError("Something went wrong... ");
    res.json({ data: "data save successfully..." });
  } catch (error) {
    next(error);
  }
});
// delete company
router.delete("/deleteRequestCompany", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest("You can not leave empty field");
    const deleteData = await RequestCompany.findOneAndDelete({ uid });
    if (!deleteData) throw createError.NotFound("Data is not found");
    res.json({ data: "Data is deleted..." });
  } catch (error) {
    next(error);
  }
});

//view all request company list

router.get("/", async (req, res, next) => {
  try {
    const findAll = await Company.find({ request: false });
    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
//get data through uid
router.get("/:uid", async (req, res, next) => {
  try {
    const { uid } = req.params;
    const findData = await RequestCompany.findOne({ uid });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});
// accept request maniculation in Company and request company
router.post("/acceptRequest", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest("YOU have to input uid..");
  } catch (error) {
    next(error);
  }
});
module.exports = router;
