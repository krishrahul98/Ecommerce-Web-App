const getDb = require("../util/database").getDb;
const mongoObjectId = require("mongodb").ObjectId;

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new mongoObjectId(userId) });
  }
}

module.exports = User;
