"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const express = require("express");
const mongoose = require("mongoose");
const app_1 = require("./startup/app");
const lib_1 = require("./lib");
const routes = require("./routes");
mongoose.connect(lib_1.Config.MONGO_URI + '', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err));
const router = express.Router();
router.use('/auth', routes.AuthRoutes);
router.use('/user', routes.UserRoutes);
app_1.default.use('/api/v1', router);
app_1.default.listen(lib_1.Config.PORT, () => {
    console.log('app listening', lib_1.Config.PORT);
});
lib_1.Config.routesList(app_1.default);
