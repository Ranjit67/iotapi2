const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const Company = require("../module/companyM");
const Gateway = require("../module/gatewayM");
const Sensor = require("../module/sensorModify");
const { auth } = require("../firebase/firebaseCreadnatil");
const CompanyUser = require("../module/userM");
// const User = require("../module/")
// var firebase = require("firebase");

const nodemailer = require("nodemailer");
//for mail auth
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "no.reply.reveal@gmail.com",
    pass: "revealP@ssw0rd",
  },
});
//end mail
//firebase setup
// const fire = firebase.initializeApp({
//   apiKey: "AIzaSyCl7xi4Z9-hsiay5UJD-4Kd8gKl2WbFMXs",
//   authDomain: "vdeal-iot.firebaseapp.com",
//   databaseURL: "https://vdeal-iot.firebaseio.com",
//   projectId: "vdeal-iot",
//   storageBucket: "vdeal-iot.appspot.com",
//   messagingSenderId: "571479339",
//   appId: "1:571479339:web:0c3601f111209a0a98a16e",
// });
// const auth = fire.auth();
//firebase setup end
router.post("/create", async (req, res, next) => {
  try {
    const { email, location, name, uid, password } = req.body;
    if (!email || !location || !name || !uid)
      throw createError.BadRequest("You can not leave any field empty...");

    const company = new Company({
      email,
      location,
      name,
      request: false,
      uid,
      password,
    });
    const saver = await company.save();
    if (!saver) throw createError.InternalServerError("Something went wrong");
    //mail contain
    const mailOption = {
      from: "sahooranjit519@gmail.com",
      to: email,
      subject: "Thanks for register",
      text: `Hello ${name},⁣
      ⁣
      Thanks for registering with us and taking your time to for applying for the registration process. Your request is currently under review, once its approved you will be informed automatically through a mail.⁣
      ⁣
      Thanks & Regards,`,
    };
    const send = await transport.sendMail(mailOption);

    if (send) res.json({ data: "data save successfully...", sendMail: true });
    else res.json({ data: "data save successfully...", sendMail: false });
    // mail contain end
  } catch (error) {
    next(error);
  }
});
router.post("/adminCreate", async (req, res, next) => {
  try {
    const { email, location, name, password, role } = req.body;
    if (!email || !location || !name)
      throw createError.BadRequest("You can not leave any field empty...");
    const response = await auth.createUserWithEmailAndPassword(email, password);
    if (!response)
      throw createError.NotAcceptable("Something wrong in firebase ...");

    const company = new Company({
      email,
      location,
      name,
      request: true,
      uid: response.user.uid,
      password,
    });
    const saver = await company.save();
    if (!saver) throw createError.InternalServerError("Something went wrong");

    const companyUser = new CompanyUser({
      displayName: name,
      email,

      role,

      uid: response.user.uid,
    });
    const saverCompany = await companyUser.save();
    if (!saverCompany)
      throw createError.InternalServerError("Something went wrong in save");

    //mail contain
    const mailOption = {
      from: "sahooranjit519@gmail.com",
      to: email,
      subject: "Thanks for register",
      text: `Hello ${name},⁣
      ⁣
      Thanks for registering with us and taking your time to for applying for the registration process.
      ⁣
      Thanks & Regards,`,
    };
    const send = await await transport.sendMail(mailOption);

    if (send) res.json({ data: "data save successfully...", sendMail: true });
    else res.json({ data: "data save successfully...", sendMail: false });
    // mail contain end
  } catch (error) {
    next(error);
  }
});
//temp

//end

router.post("/updateDevice", async (req, res, next) => {
  try {
    const { companyUid, gatewayMacId, sensorMacId, dataConfig } = req.body;
    const findCompany = await Company.findOne({ uid: companyUid });
    const findGateway = await Gateway.findOne({ gatewayID: gatewayMacId });
    if (!findGateway)
      throw createError.NotAcceptable("gateway is not found...");
    const findSensor = await Sensor.findOne({ macID: sensorMacId });
    // console.log(findSensor);
    if (!findSensor) throw createError.NotFound("sensor is not found...");

    const findGatewayInCompany = await Company.findOne({
      uid: companyUid,
      devices: { $elemMatch: { gateway: findGateway._id } },
    });

    //CHECK sensor is not  assign to other
    const checkSensor = await Company.findOne({
      devices: {
        $elemMatch: { sensor: { $elemMatch: { sensorId: findSensor._id } } },
      },
    });
    if (checkSensor)
      throw createError.Conflict("Sensor is assign to others...");
    //end
    //connectStatus sensor
    const connectStatusChange = await Sensor.findOneAndUpdate(
      { _id: findSensor._id },
      {
        connectionStatus: true,

        connectedTo: companyUid,
        connectedGatewayMacId: gatewayMacId,
        connectedDeviceUid: findSensor._id,
        connectedDeviceConfig: dataConfig,
      },
      { useFindAndModify: false }
    );
    if (!connectStatusChange)
      throw createError.InternalServerError("Data is not updated..");
    //connect status sensor end
    //connection check gateway
    if (!findGateway.connectionStatus) {
      const connectStatusChangeGateway = await Gateway.findOneAndUpdate(
        { _id: findGateway._id },
        { connectionStatus: true, connectedTo: companyUid },
        { useFindAndModify: false }
      );
      if (!connectStatusChangeGateway)
        throw createError.InternalServerError("Data is not updated..");
    }
    //gateway end
    //GOT GATEWAY IN COMPANY
    if (findGatewayInCompany) {
      const updateSensor = await Company.updateOne(
        {
          uid: companyUid,
          devices: { $elemMatch: { gateway: findGateway._id } },
        },
        {
          $addToSet: {
            "devices.$.sensor": {
              verify: false,
              sensorId: findSensor._id,
              dataConfig: dataConfig,
            },
          },
        }
      );
      if (!updateSensor)
        throw createError.InternalServerError("Update not happening...");

      //mail option start
      // checkSensor.email
      // gatewayMacId, sensorMacId,
      // console.log(findCompany.email);
      const mailOption = {
        from: "sahooranjit519@gmail.com",
        to: findCompany.email,
        subject: "Thanks for register",
        text: `Hello ${findCompany.email},⁣⁣⁣⁣
        ⁣⁣⁣⁣
        We hope that you are doing good. A new device has been linked to your company. Below are the details of the device linked:⁣
        MAC ID:⁣${gatewayMacId}
        bleID:${findGateway.bleID}
        Connection string:${findGateway.connectionString}
        sensor MAC I:⁣${sensorMacId}
        ⁣
        For any further queries feel free to reach us. Thanks for your time.⁣⁣⁣
        ⁣⁣⁣⁣
        Thanks & Regards`,
      };
      const send = await transport.sendMail(mailOption);

      if (send)
        res.json({ data: "Data updated successfully...", sendMail: true });
      else res.json({ data: "Data updated successfully...", sendMail: false });
      //mail option start
    } else {
      //check gateway to other
      const checkGatewayOtherCompany = await Company.findOne({
        "devices.gateway": findGateway._id,
      });
      if (checkGatewayOtherCompany)
        throw createError.Conflict("Gateway is assign to other company..");
      //end check gateway
      const updateGateway = await Company.updateOne(
        { uid: companyUid },
        {
          $addToSet: {
            devices: {
              gateway: findGateway._id,
            },
          },
        }
      );
      if (!updateGateway)
        throw createError.InternalServerError("Update not happening...");
      const updateSensorAfter = await Company.updateOne(
        {
          uid: companyUid,
          devices: { $elemMatch: { gateway: findGateway._id } },
        },
        {
          $addToSet: {
            "devices.$.sensor": {
              verify: false,
              sensorId: findSensor._id,
              dataConfig: dataConfig,
            },
          },
        }
      );
      if (!updateSensorAfter)
        throw createError.InternalServerError("Update not happening...");
      // console.log(findCompany.email);
      const mailOption = {
        from: "sahooranjit519@gmail.com",
        to: findCompany.email,
        subject: "Thanks for register",
        text: `Your Gateway MAC ID ${gatewayMacId}
        bleID:${findGateway.bleID}
        Connection string:${findGateway.connectionString}

        is connected to sensor ${sensorMacId}`,
      };
      const send = await transport.sendMail(mailOption);

      if (send) res.send({ data: "updated successfully...", sendMail: true });
      else res.send({ data: "updated successfully...", sendMail: false });
    }
  } catch (error) {
    next(error);
  }
});

//update verify gateway on device list
router.put("/verifyGateway", async (req, res, next) => {
  try {
    const { companyUid, gatewayMacId, sensorMacId } = req.body;

    if (!companyUid || !gatewayMacId)
      throw createError.BadRequest("All field are required..");
    const findSensor = await Sensor.findOne({ macID: sensorMacId });
    if (!findSensor) throw createError.NotFound("Sensor is not found.");
    const findGateway = await Gateway.findOne({ gatewayID: gatewayMacId });
    if (!findGateway) throw createError.NotFound("Gateway is not found...");
    const findData = await Company.findOne({
      uid: companyUid,
      devices: { $elemMatch: { gateway: findGateway._id } },
    });
    // console.log(findGateway._id);
    // console.log(findData);
    if (!findData) throw createError.Conflict("Gateway not found..");
    // const verifyCheck = findData.devices.find(
    //   (check) => check.gateway == findGateway._id
    // );
    const tempGateway = await findData.devices.find(
      (id) => id.gateway == findGateway.id
    );
    if (!tempGateway)
      throw createError.NotFound("Gateway not found from company..");
    const tempData = tempGateway.sensor;
    const findIndexNum = tempGateway.sensor.findIndex(
      (data) => data.sensorId == findSensor.id
    );
    const sensorCheck = await tempGateway.sensor.find(
      (id) => id.sensorId == findSensor.id
    );
    await tempData.splice(findIndexNum, 1, {
      verify: true,
      sensorId: findSensor.id,
      dataConfig: sensorCheck.dataConfig,
    });

    // const otherData = await tempGateway.sensor.filter(
    //   (id) => id !== sensorCheck
    // );

    if (!sensorCheck)
      throw createError.NotFound("Sensor not found on this gateway..");
    if (sensorCheck.verify)
      throw createError.Conflict("The device is already active.. ");

    const tempFind = await Company.findOneAndUpdate(
      {
        uid: companyUid,
        devices: { $elemMatch: { "sensor.sensorId": findSensor.id } },
      },
      {
        $set: {
          "devices.$.sensor": tempData,
          // [
          //   {
          //     verify: true,
          //     sensorId: findSensor.id,
          //     dataConfig: sensorCheck.dataConfig,
          //   },
          //   ...otherData,
          // ],
        },
      },

      { useFindAndModify: false }
    );
    if (!tempFind) throw createError.Conflict("Something went wrong");
    res.send({
      data: "your device is verified..",
    });
  } catch (error) {
    next(error);
  }
});

//update support
router.put("/UpdateSupport", async (req, res, next) => {
  try {
    const { uid, support } = req.body;
    if (!uid) throw createError.BadRequest();
    const updateSupport = await Company.findOneAndUpdate(
      { uid },
      { support },
      { useFindAndModify: false }
    );
    if (!updateSupport)
      throw createError.NotFound("The company is not found..");
    res.json({ data: "Update successfully...." });
  } catch (error) {
    next(error);
  }
});

//support end

// all company
router.get("/", async (req, res, next) => {
  try {
    const findAll = await Company.find().populate("devices.gateway");

    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
//find all requested company
router.get("/requested", async (req, res, next) => {
  try {
    const findAll = await Company.find({ request: false });
    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
// find all exited company
router.get("/exitCompany", async (req, res, next) => {
  try {
    const findAll = await Company.find({ request: true });
    res.json({ data: findAll });
  } catch (error) {
    next(error);
  }
});
//delete company
router.delete("/remove", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest();
    const deleteData = await Company.findOneAndDelete({ uid });
    // console.log(deleteData.email);
    if (!deleteData)
      throw createError.InternalServerError(
        "The company not found or some error..."
      );
    const mailOption = {
      from: "sahooranjit519@gmail.com",
      to: deleteData.email,
      subject: "Thanks",
      text: `Hello ${deleteData.name},⁣⁣⁣
      ⁣⁣⁣
      We hope that you are doing good. We are immensely sorry to inform you that your previous registration for addition of your company has been rejected. If you have any further queries kindly feel free to contact us directly. Thanks for your time.⁣⁣
      ⁣⁣⁣
      Thanks & Regards`,
    };
    const send = await transport.sendMail(mailOption);
    if (send) {
      res.json({ data: "Data deleted successfully...", sendMail: true });
    } else {
      res.json({ data: "Data deleted successfully...", sendMail: false });
    }
  } catch (error) {
    next(error);
  }
});

// find gateways details in company
router.post("/findGatewayCompany", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest("You can't leave empty..");
    const findData = await Company.findOne({ uid })
      .populate("devices.gateway")
      .populate("devices.sensor.sensorId");
    res.json({ data: findData.devices });
  } catch (error) {
    next(error);
  }
});
// find sensors through uid and gateway macId
router.post("/findSensorsCompany/gateway", async (req, res, next) => {
  try {
    const { uid, gatewayMacId } = req.body;
    const findGateway = await Gateway.findOne({ gatewayID: gatewayMacId });
    if (!findGateway) throw createError.NotFound("gateway is not found..");
    const findData = await Company.findOne({
      uid,
      devices: { $elemMatch: { gateway: findGateway._id } },
    }).populate("devices.sensor.sensorId");
    if (!findData) throw createError.NotFound("No sensor is available...");
    res.json({
      data: findData.devices.find((id) => id.gateway == findGateway.id),
    });
  } catch (error) {
    next(error);
  }
});
//delete company
router.delete("/delete", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest("field is required....");
    const findCompany = await Company.findOne({ uid });
    if (!findCompany) throw createError.NotFound("The company is not found..");
    await Sensor.updateMany(
      { connectedTo: uid },
      { connectionStatus: false, connectedTo: null }
    );
    await Gateway.updateMany(
      { connectedTo: uid },
      {
        connectionStatus: false,
        connectedTo: null,
        userAssign: null,
        secondLevelUserUid: null,
      }
    );
    //type 1 user find
    const companyUsers = await CompanyUser.find({ companyUid: uid }); //companyUid
    companyUsers.forEach(async (element) => {
      //type 2 user array
      const type2User = await CompanyUser.find({
        secondUserLinkUid: element.uid,
      });
      type2User.forEach(async (tyUser) => {
        //delete type 2 user
        if (tyUser.email && tyUser.password) {
          await auth.signInWithEmailAndPassword(tyUser.email, tyUser.password);
          await auth.currentUser.delete();
        }
        await CompanyUser.findOneAndDelete({ uid: tyUser.uid });
      });
      // type 1 delete
      if (element.email && element.password) {
        await auth.signInWithEmailAndPassword(element.email, element.password);
        await auth.currentUser.delete();
      }
      await CompanyUser.findOneAndDelete({ uid: element.uid });
    });
    // await CompanyUser.deleteMany({ companyUid: uid });

    if (findCompany.email && findCompany.password) {
      await auth.signInWithEmailAndPassword(
        findCompany.email,
        findCompany.password
      );
      await auth.currentUser.delete();
    }
    const deleteCompany = await Company.findOneAndDelete({ uid });
    if (!deleteCompany)
      throw createError.InternalServerError("Something went wrong..");
    res.json({ data: "Delete successfully..." });
  } catch (error) {
    next(error);
  }
});

//delete company end
// check accept or reject

//check end
//get companies through uid
router.get("/:uid", async (req, res, next) => {
  try {
    const { uid } = req.params;
    const findData = await Company.findOne({ uid });
    res.json({ data: findData });
  } catch (error) {
    next(error);
  }
});

router.post("/accept", async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw createError.BadRequest();
    const findCompany = await Company.findOne({ uid });
    if (!findCompany) throw createError.NotFound("The company is not found..");
    if (findCompany.request)
      throw createError.Conflict("This user already accept...");
    const updateData = await Company.findOneAndUpdate(
      { uid },
      { request: true },
      { useFindAndModify: false }
    );
    if (!updateData)
      throw createError.InternalServerError(
        "Something went wrong data not updated..."
      );
    const mailOption = {
      from: "sahooranjit519@gmail.com",
      to: findCompany.email,
      subject: "Thanks",
      text: `Hello ${findCompany.name},⁣⁣
      ⁣⁣
      We hope that you are doing good. It's our immense pleasure to inform you that your previous company registration request has been accepted from our side and your company is now added. Thanks for your time.⁣
      ⁣⁣
      Thanks & Regards`,
    };
    const send = await transport.sendMail(mailOption);
    if (send) {
      res.json({ data: "Request accepted...", sendMail: true });
    } else {
      res.json({ data: "Request accepted...", sendMail: false });
    }
  } catch (error) {
    next(error);
  }
});

//remove gateway from company
router.post("/removeGatewayFromCompany", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

module.exports = router;
