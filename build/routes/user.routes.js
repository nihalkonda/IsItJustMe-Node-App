"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const lib_1 = require("node-library");
const controllers_1 = require("../controllers");
const router = express_1.Router();
exports.router = router;
const userController = new controllers_1.UserController();
//router.post('/',LoggerMiddleware('v1'),userController.create)
router.get('/', lib_1.Middlewares.authCheck(false), userController.getAll);
router.put('/', lib_1.Middlewares.authCheck(true), userController.update);
router.get('/me', lib_1.Middlewares.authCheck(true), userController.getMe);
router.get('/:id', lib_1.Middlewares.authCheck(false), userController.getId);
router.delete('/delete_all', userController.deleteAll);
