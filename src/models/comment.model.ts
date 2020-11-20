import * as mongoose from 'mongoose';
import { LocationSchema } from '../schemas';

const commentSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:'author is required',
        ref:'User'
    },
    postId:{
        type: String,
        required:'postId is required'
    },
    content:{
        type: String,
        trim: true,
        required:'content is required'
    },
    context:{
        type: String,
        enum: ['general','update','resolved'],
        default : 'general'
    },
    location:LocationSchema,
    createdAt:{
        type:Date,
        default:Date.now
    },
    lastModifiedAt:{
        type:Date,
        default:Date.now
    }
});

const Comment = mongoose.model('Comment',commentSchema);

export default Comment;