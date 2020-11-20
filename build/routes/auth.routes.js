"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const lib_1 = require("node-library");
const controllers_1 = require("../controllers");
const router = express_1.Router();
exports.router = router;
const authController = new controllers_1.AuthController();
router.post('/sign_up', authController.signUp);
router.post('/sign_in', authController.signIn);
router.get('/access_token', lib_1.Middlewares.authCheck(true, true), authController.getAccessToken);
router.delete('/sign_out', lib_1.Middlewares.authCheck(true, true), authController.signOut);
router.delete('/sign_out_all', lib_1.Middlewares.authCheck(true, true), authController.signOutAll);
router.delete('/delete_all', authController.deleteAll);
/*
{
    userAuth:{
        email:1,
        password:1,
        account:{
            type:1
        }
    },
    userDetails:{
        firstName:1,
        lastName:1
    }
}
*/ 
