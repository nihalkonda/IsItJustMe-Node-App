"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubMessageTypes = void 0;
const PubSubMessageTypes = {
    AUTH: {
        USER_SIGNED_UP: "AUTH_USER_SIGNED_UP",
        USER_SIGNED_IN: "AUTH_USER_SIGNED_IN",
        USER_SIGN_OUT: "AUTH_USER_SIGN_OUT",
        USER_SIGN_OUT_ALL: "AUTH_USER_SIGN_OUT_ALL",
        ACCESS_TOKEN: "AUTH_ACCESS_TOKEN"
    },
};
exports.PubSubMessageTypes = PubSubMessageTypes;
