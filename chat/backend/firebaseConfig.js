// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./chatcode-3ff70-firebase-adminsdk-deood-7794218fcc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatcode-3ff70-default-rtdb.firebaseio.com/"
});

const db = admin.database();
module.exports = db;
