import * as mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    mainType:{
        type: String,
        trim: true,
        lowercase: true,
        required:'mainType is required'
    },
    subType:{
        type: String,
        trim: true,
        lowercase: true,
        required:'subType is required'
    },
    count:{
        type:Number,
        default:0
    }
});

tagSchema.index({'mainType':1,'subType':1},{unique:true});

const Tag = mongoose.model('Tag',tagSchema);

export default Tag;