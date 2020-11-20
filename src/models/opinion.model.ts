import * as mongoose from 'mongoose';

const opinionSchema = new mongoose.Schema({
    author:{
        type:String,
        required: 'author is required'
    },
    postId:{
        type: String,
        required:'postId is required'
    },
    body:{
        type: String
    },
    opinionType:{
        type:String,
        enum:['follow','upvote','downvote','spamreport'],
        default:'upvote'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Opinion = mongoose.model('Opinion',opinionSchema);

export default Opinion;