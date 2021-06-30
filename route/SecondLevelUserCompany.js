const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Company = require("../module/companyM");
const Gateway = require("../module/gatewayM");

// const CompanyUser = require("../module/companyUserM");
const CompanyUser = require("../module/userM");
const { auth } = require("../firebase/firebaseCreadnatil");

router.post("/create", async (req, res, next) => {
  try {
    const { email, password, userUid } = req.body;
    if (!email || !password || !userUid)
      throw createError.BadRequest("All field are required...");
    const findUser = await CompanyUser.findOne({ email });
    if (findUser)
      throw createError.Conflict("This user is already registered... ");
    const response = await auth.createUserWithEmailAndPassword(email, password);
    if (!response)
      throw createError.NotAcceptable("Something wrong in firebase ...");

    const companyUser = new CompanyUser({
      email,
      password,
      uid: response.user.uid,
      secondUserLinkUid: userUid,
      role: "level 2 user",
    });
    const saver = await companyUser.save();
    if (!saver) throw createError.GatewayTimeout("Something went wrong...");

    res.json({ data: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});

//view all users list under first company user
router.post("/viewAllUserUnderFirstUser", async (req, res, next) => {
  try {
    const { firstUserUid } = req.body;
    if (!firstUserUid)
      throw createError.BadRequest("firstUserUid is a required field....");
    const findUser = await CompanyUser.find({
      secondUserLinkUid: firstUserUid,
      role: "level 2 user",
    });
    res.json({ data: findUser });
  } catch (error) {
    next(error);
  }
});
//user one assign the gateway to the second level user

router.post("/assignGateway", async (req, res, next) => {
  try {
    const { gatewayMacId, userUid, secondLevelUserUid } = req.body;
    if (!gatewayMacId || !userUid || !secondLevelUserUid)
      throw createError.BadRequest("All three field are required field...");
    const findGatewayInCompany = await Gateway.findOne({
      gatewayID: gatewayMacId,
      userAssign: userUid,
    });
    if (!findGatewayInCompany)
      throw createError.NotFound("The gateway is not found..."); //

    if (findGatewayInCompany.connectionStatus) {
      const checkGatewayAssign = await CompanyUser.findOne({
        role: "level 2 user",
        gatewayList: findGatewayInCompany.id,
      });
      if (checkGatewayAssign)
        throw createError.Conflict("This gateway is assign other user ");
      const findUser = await CompanyUser.findOne({
        uid: secondLevelUserUid,
        role: "level 2 user",
      });
      if (!findUser)
        throw createError.Conflict("you are assigning gateway in wrong user..");

      const updateInGateway = await Gateway.findOneAndUpdate(
        { gatewayID: gatewayMacId, userAssign: userUid },
        {
          secondLevelUserUid: secondLevelUserUid,
        },
        { useFindAndModify: false }
      );
      if (!updateInGateway)
        throw createError.GatewayTimeout("Fail to update in gateway...");
      const updateUser = await CompanyUser.findOneAndUpdate(
        {
          uid: secondLevelUserUid,
          secondUserLinkUid: userUid,
          role: "level 2 user",
        },
        {
          $push: { gatewayList: findGatewayInCompany.id },
        },
        { useFindAndModify: false }
      );
      if (!updateUser)
        throw createError.GatewayTimeout(
          "You are assigning may be wrong user or not belong to you..."
        );
      res.json({ data: "Successfully gateway add..." });
    } else {
      throw createError.Conflict(
        "This gateway is not belong to your company..."
      );
    }
  } catch (error) {
    next(error);
  }
});
//list of gateway in user
router.post("/listGatewayUser", async (req, res, next) => {
  try {
    const { secondLevelUserUid } = req.body;
    const findUser = await CompanyUser.findOne({
      uid: secondLevelUserUid,
      role: "level 2 user",
    }).populate("gatewayList");
    res.json({ data: findUser });
  } catch (error) {
    next(error);
  }
});
//remove gateway from second level user
//This one do by user
router.post("/removegatewaysecondlevel", async (req, res, next) => {
  try {
    const { gatewayMacId, userUid, secondLevelUserUid } = req.body;
    if (!gatewayMacId || !userUid || !secondLevelUserUid)
      throw createError.BadRequest("All three field are required...");
    const findGateway = await Gateway.findOne({
      gatewayID: gatewayMacId,
      userAssign: userUid,
      secondLevelUserUid: secondLevelUserUid,
    });
    if (!findGateway)
      throw createError.NotFound("This gateway not belong to this user...");
    const updateInGateway = await Gateway.findOneAndUpdate(
      {
        gatewayID: gatewayMacId,
        userAssign: userUid,
        secondLevelUserUid: secondLevelUserUid,
      },
      {
        secondLevelUserUid: null,
      },
      { useFindAndModify: false }
    );
    if (!updateInGateway)
      throw createError.RequestTimeout("In gateway updation failed..");
    // console.log(findGateway._id);
    const removeGateway = await CompanyUser.findOneAndUpdate(
      {
        uid: secondLevelUserUid,
        secondUserLinkUid: userUid,
        role: "level 2 user",
      },
      {
        $pull: { gatewayList: findGateway._id },
      },
      { useFindAndModify: false }
    );
    if (!removeGateway)
      throw createError.GatewayTimeout("Gateway is not remove from user..");
    res.json({ data: "Gateway withdraw successfully..." });
  } catch (error) {
    next(error);
  }
});

//delete second level user by company user
router.delete("/deleteSecondLevelUser", async (req, res, next) => {
  try {
    const { secondLevelUserUid } = req.body;
    if (!secondLevelUserUid)
      throw createError.BadRequest("All field are required ...");
    const findUser = await CompanyUser.findOne({
      uid: secondLevelUserUid,
      role: "level 2 user",
    });
    if (!findUser) throw createError.NotFound("The User is not found..");
    const updateGateway = await Gateway.updateMany(
      {
        secondLevelUserUid: secondLevelUserUid,
      },
      {
        secondLevelUserUid: null,
      }
    );
    if (findUser.email && findUser.password) {
      await auth.signInWithEmailAndPassword(findUser.email, findUser.password);
      await auth.currentUser.delete();
    }
    const deleteUser = await CompanyUser.findOneAndDelete({
      uid: secondLevelUserUid,
    });
    if (!deleteUser) throw createError.NotFound("Something going wrong...");
    res.json({ data: "User is successfully deleted... " });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
