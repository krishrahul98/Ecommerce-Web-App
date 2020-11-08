const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../util/middleware/is-auth");

const router = express.Router();

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title Should be Atleast 3 characters long")
      .trim()
      .isLength({ min: 3 })
      .isAlphanumeric(),
    body("imageUrl", "Should be Valid Url").isURL(),
    body("price", "Price Should be valid").isNumeric(),
    body("description", "Description Should be between 5 and 400 characters")
      .trim()
      .isLength({ min: 5, max: 400 }),
  ],
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  "/edit-product",
  isAuth,
  [
    body("title", "Title Should be Atleast 3 characters long")
      .trim()
      .isLength({ min: 3 }),
    body("imageUrl", "Should be Valid Url").isURL(),
    body("price", "Price Should be valid").isNumeric(),
    body("description", "Description Should be between 5 and 400 characters")
      .trim()
      .isLength({ min: 5, max: 400 }),
  ],
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
