const express = require("express");
const bodyParser = require("body-parser");

//Read Environment Variables
require("dotenv").config();

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Temporary Database User
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//Database Relations
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
let currentUser;

//For testing Database with one user
sequelize
  //.sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Rahul", email: "rahul@rahul.com" });
    }
    return user;
  })
  .then((user) => {
    //console.log(user);
    currentUser = user;
    return Cart.findByPk(1);
  })
  .then((cart) => {
    if (!cart) {
      return currentUser.createCart();
    }
    return cart;
  })
  .then((cart) => {
    app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
