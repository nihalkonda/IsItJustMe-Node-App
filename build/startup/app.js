"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const lib_1 = require("node-library");
const services_1 = require("../services");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(lib_1.Middlewares.logger('v1'));
app.use(lib_1.Middlewares.requestProcessor(services_1.RefreshTokenService));
exports.default = app;