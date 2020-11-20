"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: 'author is required',
        ref: 'User'
    },
    title: {
        type: String,
        trim: true,
        required: 'title is required'
    },
    content: {
        type: String,
        trim: true,
        required: 'content is required!'
    },
    tags: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }],
    location: {},
    stats: {
        viewsCount: {
            type: Number,
            default: 0
        },
        upvoteCount: {
            type: Number,
            default: 0
        },
        downvoteCount: {
            type: Number,
            default: 0
        },
        resolvedCount: {
            type: Number,
            default: 0
        }
    }
});
const Post = mongoose.model('Post', postSchema);
exports.default = Post;
