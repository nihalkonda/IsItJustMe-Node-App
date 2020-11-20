"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("node-library");
const models_1 = require("../models");
class UserRepository extends lib_1.Repositories.BaseRepository {
    constructor() {
        super(models_1.User);
        this.getUserByEmail = (email) => __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email });
        });
        this.getUserByUserId = (userId) => __awaiter(this, void 0, void 0, function* () {
            console.log('UserRepository', 'getUserByUserId', userId);
            return yield this.model.findOne({ userId });
        });
        this.updateUserByEmail = (email, entity) => __awaiter(this, void 0, void 0, function* () {
            delete entity.userId;
            delete entity.email;
            return yield this.model.findOneAndUpdate({ email }, entity, { new: true });
        });
        this.updateUserByUserId = (userId, entity) => __awaiter(this, void 0, void 0, function* () {
            delete entity.userId;
            return yield this.model.findOneAndUpdate({ userId }, entity, { new: true });
        });
    }
}
exports.default = UserRepository;
