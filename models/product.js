const mongoObjectId = require("mongodb").ObjectId;
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongoObjectId(id) : null;
    this.userId = userId;
  }
  save() {
    const db = getDb();
    if (this._id) {
      //Update the product
      return db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      return db.collection("products").insertOne(this);
    }
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }

  static findById(productId) {
    const db = getDb();
    return db
      .collection("products")
      .findOne({ _id: new mongoObjectId(productId) });
  }

  static deleteById(productId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongoObjectId(productId) });
  }
}

module.exports = Product;
