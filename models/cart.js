const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "cart.json");

module.exports = class Cart {
  static addProduct(productId, productPrice) {
    //Fetch the previous cart
    fs.readFile(filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      //Analyze cart => Find Previous product
      const existingProductIndex = cart.products.findIndex(
        (product) => product.id === productId
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      //Add new Product / Increase Quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: productId, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }
  static deleteProduct(productId, productPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find(
        (product) => product.id === productId
      );
      if (!product) {
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (product) => product.id !== productId
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productQty * productPrice;
      fs.writeFile(filePath, JSON.stringify(updatedCart), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  static getCart(callback) {
    fs.readFile(filePath, (err, fileContent) => {
      if (err) {
        callback(null);
      } else {
        const cart = JSON.parse(fileContent);
        callback(cart);
      }
    });
  }
};
