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
const profile = require("../../processes/profile.process");
const lib_1 = require("../../node-library");
var expect = lib_1.Test.Chai.expect;
describe('Profile', () => {
    describe('Id', () => {
        it('anonymous', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let response = yield profile.getAll({
                    responseStatus: 200
                });
                console.log(response);
                const id = response.result[0].userId;
                response = yield profile.id({
                    id,
                    responseStatus: 200
                });
                console.log(response);
                expect(response.userId).to.be.equal(id);
            });
        });
    });
});
