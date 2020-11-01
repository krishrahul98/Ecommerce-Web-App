const MongoClient = require("mongodb").MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
    .then((client) => {
      console.log("Database Connected");
      _db = client.db("shop");
      callback();
    })
    .catch((err) => {
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No Database Found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
