const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Company = require("../module/companyM");
const Gateway = require("../module/gatewayM");
// const CompanyUser = require("../module/companyUserM");
const CompanyUser = require("../module/userM");
const { auth } = require("../firebase/firebaseCreadnatil");
const { post } = require("./company");

const nodemailer = require("nodemailer");
//for mail auth
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "no.reply.reveal@gmail.com",
    pass: "revealP@ssw0rd",
  },
});

router.post("/create", async (req, res, next) => {
  try {
    const { email, password, companyUid } = req.body;
    if (!email || !password || !companyUid)
      throw createError.BadRequest("All field are required...");
    const findCompanyData = CompanyUser.findOne({ uid: companyUid });
    if (!findCompanyData)
      throw createError.BadRequest("Your company is not exit...");
    const findUser = await CompanyUser.findOne({ email });
    console.log(findUser);
    if (findUser)
      throw createError.Conflict("This user is already registered... ");
    const response = await auth.createUserWithEmailAndPassword(email, password);
    if (!response)
      throw createError.NotAcceptable("Something wrong in firebase ...");

    const companyUser = new CompanyUser({
      email,
      password,
      uid: response.user.uid,
      companyUid,
      role: "user",
    });
    const saver = await companyUser.save();
    if (!saver) throw createError.GatewayTimeout("Something went wrong...");

    const mailOption = {
      from: "sahooranjit519@gmail.com",
      to: email,
      subject: "Thanks for register",
      text: `Hi...⁣
      ⁣
      You are successfully added into Reveal Sense under ${
        findCompanyData.name ? findCompanyData.name : "this company"
      }. 
      Here credentials .
      User Id: ${email}
      Password: ${password}

      For login please download RevealSense 
      app: - https://play.google.com/store/apps/details?id=com.vdealiot
      or web app
      https://vdeal-iot.web.app/
      ⁣
      Thanks & Regards,`,
    };
    await transport.sendMail(mailOption);

    res.json({ data: "Data save successfully..." });
  } catch (error) {
    next(error);
  }
});
// find add user by company
router.post("/findUserCompany", async (req, res, next) => {
  try {
    const { companyUid } = req.body;
    if (!companyUid)
      throw createError.BadRequest("Company uid is required filed...");
    const findUser = await CompanyUser.find({ companyUid, role: "user" });
    res.json({ data: findUser });
  } catch (error) {
    next(error);
  }
});
//Gateway assign to companyUser
router.post("/gatewayAssign", async (req, res, next) => {
  try {
    const { gatewayMacId, companyUid, userUid } = req.body;
    if (!gatewayMacId || !companyUid || !userUid)
      throw createError.BadRequest("All three field are required field...");
    const findGatewayInCompany = await Gateway.findOne({
      gatewayID: gatewayMacId,
    });
    if (!findGatewayInCompany)
      throw createError.NotFound("The gateway is not found...");
    if (findGatewayInCompany.connectionStatus) {
      if (findGatewayInCompany.connectedTo !== companyUid)
        throw createError.Conflict(
          "This gateway is not belong to your company..."
        );
      const checkGatewayAssign = await CompanyUser.findOne({
        gatewayList: findGatewayInCompany.id,
        role: "user",
      });
      // console.log(checkGatewayAssign);
      if (checkGatewayAssign)
        throw createError.Conflict("This gateway is assign other user ");
      const findUser = await CompanyUser.findOne({
        uid: userUid,
        role: "user",
      });
      if (!findUser)
        throw createError.Conflict("you are assigning gateway in wrong user..");

      const updateInGateway = await Gateway.findOneAndUpdate(
        { gatewayID: gatewayMacId },
        {
          userAssign: userUid,
        },
        { useFindAndModify: false }
      );
      if (!updateInGateway)
        throw createError.GatewayTimeout("Fail to update in gateway...");
      const updateUser = await CompanyUser.findOneAndUpdate(
        { uid: userUid, companyUid: companyUid, role: "user" },
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
    const { userUid } = req.body;
    const findUser = await CompanyUser.findOne({
      uid: userUid,
      role: "user",
    }).populate("gatewayList");
    res.json({ data: findUser });
  } catch (error) {
    next(error);
  }
});
// Company remove gateway from company user
router.post("/removeGatewayCompany", async (req, res, next) => {
  try {
    const { gatewayMacId, companyUid, userUid } = req.body;
    if (!gatewayMacId || !companyUid || !userUid)
      throw createError.BadRequest("All three field are required field...");
    const findGatewayInCompany = await Gateway.findOne({
      gatewayID: gatewayMacId,
      userAssign: userUid,
      connectedTo: companyUid,
    });
    if (!findGatewayInCompany)
      throw createError.NotFound("The gateway is not found...");
    const removeGatewayFirst = await CompanyUser.findOneAndUpdate(
      {
        uid: userUid,
        companyUid: companyUid,
        role: "user",
      },
      {
        $pull: { gatewayList: findGatewayInCompany._id },
      },
      { useFindAndModify: false }
    );
    if (!removeGatewayFirst)
      throw createError.NotFound("The gateway is not found on this user..");
    const removeFromSecond = await CompanyUser.findOneAndUpdate(
      {
        secondUserLinkUid: userUid,
        role: "level 2 user",
        gatewayList: findGatewayInCompany._id,
      },
      {
        $pull: { gatewayList: findGatewayInCompany._id },
      },
      { useFindAndModify: false }
    ); //No check
    const updateInGateway = await Gateway.findOneAndUpdate(
      {
        gatewayID: gatewayMacId,
        userAssign: userUid,
      },
      {
        secondLevelUserUid: null,
        userAssign: null,
      },
      { useFindAndModify: false }
    );
    if (!updateInGateway)
      throw createError.GatewayTimeout("The gateway is not updated..");
    res.json({ data: "Successfully gateway is withdraw..." });
  } catch (error) {
    next(error);
  }
});

//delete companyUser by company
router.delete("/deleteCompanyUser", async (req, res, next) => {
  try {
    const { companyUserUid } = req.body;
    if (!companyUserUid)
      throw createError.BadRequest("All field are required...");
    const findUser = await CompanyUser.findOne({
      uid: companyUserUid,
      role: "user",
    });
    if (!findUser) throw createError.NotFound("The user is not found...");

    const allSecondUser = await CompanyUser.find({
      secondUserLinkUid: companyUserUid,
      role: "level 2 user",
    });
    allSecondUser.forEach(async (user) => {
      if (user.email && user.password) {
        await auth.signInWithEmailAndPassword(user.email, user.password);
        await auth.currentUser.delete();
      }
      await CompanyUser.findOneAndDelete({ uid: user.uid });
    });
    // await CompanyUser.deleteMany({
    //   secondUserLinkUid: companyUserUid,
    //   role: "level 2 user",
    // });

    await Gateway.updateMany(
      {
        userAssign: companyUserUid,
      },
      {
        userAssign: null,
        secondLevelUserUid: null,
      }
    );
    const deleteCompanyUser = await CompanyUser.findOneAndDelete({
      uid: companyUserUid,
    });

    if (findUser.email && findUser.password) {
      await auth.signInWithEmailAndPassword(findUser.email, findUser.password);
      await auth.currentUser.delete();
    }
    if (!deleteCompanyUser)
      throw createError.Forbidden("Something is wrong....");
    res.json({ data: "Successfully user is deleted..." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
