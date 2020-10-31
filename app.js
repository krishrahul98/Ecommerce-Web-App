const express = require("express");
const bodyParser = require("body-parser");

//Read Environment Variables
require("dotenv").config();

const errorController = require("./controllers/error");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
