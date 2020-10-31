const fs = require("fs");
const path = require("path");

const rootDir = require("../util/rootdir");
const filePath = path.join(rootDir, "data", "cart.json");

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
        (product) => product.productId === productId
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      //Add new Product / Increase Quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { productId: productId, qty: 1 };
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
};
