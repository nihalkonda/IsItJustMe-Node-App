import {Config} from 'node-library';
import * as mongoose from 'mongoose';
import { Tag } from "./models";

mongoose.connect(Config.MONGO_URI+'',{
    useNewUrlParser:true,
    useUnifiedTopology: true
})
.then(()=>{console.log('db connected'); test1("Who Is","He",true); })
.catch((err : mongoose.Error)=>console.log(err));

function test1(mainType:string,subType:string,increment:boolean){
    console.log('Test 1')
    let query = {"mainType":mainType,"subType":subType};

    Tag.findOneAndUpdate(query,{$set:query,$inc:{"count":increment?1:-1}},{upsert:true}).then((result)=>{
        console.log('Test 1','passed',result);
    }).catch((error)=>{
        console.log('Test 1','failed',error);
    });
}