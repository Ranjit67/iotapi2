const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const User = require("../module/userM");

router.post("/create", async (req, res, next) => {
  try {
    const {
      creationTime,
      displayName,
      email,
      lastSignTime,
      phoneNumber,
      photoURL,
      role,
      signInProvider,
      uid,
      address,
    } = req.body;
    if (!uid)
      throw createError.BadRequest(
        "You can't leave any single field to empty..."
      );
    // const findUid
    const user = new User({
      creationTime,
      displayName,
      email,
      lastSignTime,
      phoneNumber,
      photoURL,
      role,
      signInProvider,
      uid,
      address,
    });
    const saver = await user.save();
    if (!saver)
      throw createError.InternalServerError("Something went wrong in save");
    res.json({ message: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});

router.patch("/userUpdate", async (req, res, next) => {
  try {
    const {
      creationTime,
      displayName,
      email,
      lastSignTime,
      phoneNumber,
      photoURL,
      role,
      signInProvider,
      uid,
      address,
    } = req.body;
    const findData = await User.findOne({ uid });
    if (!findData) throw createError.ExpectationFailed("Does not have data...");
    const updateStatus = await User.findOneAndUpdate(
      { uid },
      {
        email: email ? email : findData.email,
        creationTime: creationTime ? creationTime : findData.creationTime,
        phoneNumber: phoneNumber ? phoneNumber : findData.phoneNumber,
        displayName: displayName ? displayName : findData.displayName,
        lastSignTime: lastSignTime ? lastSignTime : findData.lastSignTime,
        photoURL: photoURL ? photoURL : findData.photoURL,
        role: role ? role : findData.role,
        address: address ? address : findData.address,
        signInProvider: signInProvider
          ? signInProvider
          : findData.signInProvider,
      },
      { useFindAndModify: false }
    );
    if (!updateStatus) throw createError.InternalServerError();
    res.json({ data: "data updated..." });
  } catch (error) {
    next(error);
  }
});

//find user
router.get("/:uid", async (req, res, next) => {
  try {
    const { uid } = req.params;
    const userData = await User.findOne({ uid });
    res.json({ data: userData });
  } catch (error) {
    next(error);
  }
});

//find all user
router.get("/", async (req, res, next) => {
  try {
    const findAll = await User.find();

    res.json({ data: findAll.reverse() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
