"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const tagSchema = new mongoose.Schema({
    maintype: {
        type: String,
        required: 'maintype is required',
        unique: true
    },
    subtype: {
        type: String,
        required: 'subtype is required'
    },
    count: {
        type: Number,
        default: 0
    }
});
tagSchema.index({ 'maintype': 1, 'subtype': 1 }, { unique: true });
const Tag = mongoose.model('Tag', tagSchema);
exports.default = Tag;
