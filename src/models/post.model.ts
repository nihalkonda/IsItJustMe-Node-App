import * as mongoose from 'mongoose';
import { LocationSchema, StatsSchema } from '../schemas';

const postSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:'author is required',
        ref:'User'
    },
    content:{
        title:{
            type: String,
            trim: true,
            required: 'title is required'
        },
        body:{
            type: String,
            trim: true,
            required: 'body is required'
        },
        tags:[{
            type: String
        }]
    },
    status:{
        type:String,
        enum:['open','resolved'],
        default:'open'
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    location:LocationSchema,
    stats:StatsSchema,
    createdAt:{
        type:Date,
        default:Date.now
    },
    lastModifiedAt:{
        type:Date,
        default:Date.now
    },
    threadLastUpdatedAt:{
        type:Date,
        default:Date.now
    }
});

const Post = mongoose.model('Post',postSchema);

export default Post;