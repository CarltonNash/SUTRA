const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "sutra-6de49-firebase-adminsdk-fbsvc-7d3d393dc6.json")
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;