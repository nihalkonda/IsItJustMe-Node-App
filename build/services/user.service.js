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
const repositories_1 = require("../repositories");
const lib_1 = require("node-library");
const pubsub_helper_1 = require("../helpers/pubsub.helper");
class UserService extends lib_1.Services.BaseService {
    constructor() {
        super(new repositories_1.UserRepository());
        this.getUserByEmail = (request, email) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getUserByEmail(email);
        });
        this.getUserByUserId = (request, userId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getUserByUserId(userId);
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['userId', 'email', 'firstName', 'lastName', 'displayPicture'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            return this.repository.getAll(query, sort, pageSize, pageNum, attributes);
        });
        this.update = (request, entityId, body) => __awaiter(this, void 0, void 0, function* () {
            const { email, firstName, lastName, displayPicture } = body;
            return yield this.repository.updateUserByUserId(request.getUserId(), lib_1.Helpers.JSON.normalizeJson({
                email,
                firstName,
                lastName,
                displayPicture
            }));
        });
        lib_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.AUTH.USER_SIGNED_UP, this);
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    processMessage(message) {
        console.log('UserService', message);
        switch (message.type) {
            case pubsub_helper_1.PubSubMessageTypes.AUTH.USER_SIGNED_UP:
                this.userCreated(message);
                break;
            default:
                break;
        }
    }
    userCreated(event) {
        const { userId, email, firstName, lastName } = event.data;
        this.create(event.request, {
            userId,
            email,
            firstName,
            lastName
        });
    }
}
exports.default = UserService.getInstance();
