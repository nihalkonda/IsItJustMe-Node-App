import * as mongoose from 'mongoose';
import { LocationSchema } from '../schemas';

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
        tags:[{
            type: String
        }]
    },
    status:{
        type:String,
        enum:['open','resolved'],
        default:'open'
    },
    location:LocationSchema,
    stats:{
        viewsCount:{
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
        updateCount:{
            type:Number,
            default:0
        }
    },
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