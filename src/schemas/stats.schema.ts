import * as mongoose from 'mongoose';

export default new mongoose.Schema({
    viewCount:{
        type:Number,
        default:0
    },
    followCount:{
        type:Number,
        default:0
    },
    upvoteCount:{
        type:Number,
        default:0
    },
    downvoteCount:{
        type:Number,
        default:0
    },
    spamreportCount:{
        type:Number,
        default:0
    },
    commentCount:{
        type:Number,
        default:0
    },
    updateCount:{
        type:Number,
        default:0
    }
});