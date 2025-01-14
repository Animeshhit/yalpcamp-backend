const { connect } = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGO_URL;

const connectToDb = (callback) => {
  connect(url)
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      callback(true);
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB Atlas:", err);
      callback(false);
    });
};

module.exports = connectToDb;
