var firebase = require("firebase");

//firebase setup
const fire = firebase.initializeApp({
  apiKey: "AIzaSyCl7xi4Z9-hsiay5UJD-4Kd8gKl2WbFMXs",
  authDomain: "vdeal-iot.firebaseapp.com",
  databaseURL: "https://vdeal-iot.firebaseio.com",
  projectId: "vdeal-iot",
  storageBucket: "vdeal-iot.appspot.com",
  messagingSenderId: "571479339",
  appId: "1:571479339:web:0c3601f111209a0a98a16e",
});
const auth = firebase.auth();
module.exports = { auth };
//firebase setup end
