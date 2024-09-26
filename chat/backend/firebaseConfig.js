const admin = require("firebase-admin");
const serviceAccount = require("./chatcode-3ff70-firebase-adminsdk-deood-7794218fcc.json");

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatcode-3ff70-default-rtdb.firebaseio.com/"
}, 'chatcodeApp'); // Fornecendo um nome de aplicativo específico

const db = firebaseApp.database();
module.exports = db;
