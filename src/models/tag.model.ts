import * as mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    tag:{
        type: String,
        trim: true,
        lowercase: true,
        unique:true
    },
    count:{
        type:Number,
        default:0
    }
});

const Tag = mongoose.model('Tag',tagSchema);

export default Tag;