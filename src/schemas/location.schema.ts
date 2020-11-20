import * as mongoose from 'mongoose';

export default new mongoose.Schema({
    latitude:{
        type:Number,
        default:0.0
    },
    longitude:{
        type:Number,
        default:0.0
    },
    address:{
        type:String,
        default:''
    }
});