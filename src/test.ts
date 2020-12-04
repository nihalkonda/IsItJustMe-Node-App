// import {Config} from 'node-library';
// import * as mongoose from 'mongoose';
// import { TagRepository } from "./repositories";

// let tagRepository:TagRepository;

// mongoose.connect(Config.MONGO_URI+'',{
//     useNewUrlParser:true,
//     useUnifiedTopology: true
// })
// .then(()=>{
//     console.log('db connected');
//     tagRepository  = new TagRepository();
//     test1();
// }).catch((err : mongoose.Error)=>console.log(err));

// async function test1(){
//     console.log('Test 1')
//     const steps = [
//         {
//             type:'u',
//             val:'apple',
//             inc:true
//         },
//         {
//             type:'u',
//             val:'ball',
//             inc:true
//         },
//         {
//             type:'u',
//             val:'cat',
//             inc:true
//         },
//         {
//             type:'l',
//             val:'apple',
//             verify:1
//         },
//         {
//             type:'l',
//             val:'ball',
//             verify:1
//         },
//         {
//             type:'l',
//             val:'cat',
//             verify:1
//         },
//         {
//             type:'u',
//             val:'apple',
//             inc:true
//         },
//         {
//             type:'u',
//             val:'ball',
//             inc:true
//         },
//         {
//             type:'u',
//             val:'cat',
//             inc:false
//         },
//         {
//             type:'u',
//             val:'dog',
//             inc:true
//         },
//         {
//             type:'l',
//             val:'apple',
//             verify:2
//         },
//         {
//             type:'l',
//             val:'ball',
//             verify:2
//         },
//         {
//             type:'l',
//             val:'cat',
//             verify:0
//         },
//         {
//             type:'l',
//             val:'dog',
//             verify:1
//         },
//         {
//             type:'dl',
//             arr:['apple','ball','cat','dog']
//         }
//     ];

//     for (const step of steps) {
//         console.log(step);
//         if(step.type==='u'){
//             console.log(await tagRepository.updateTag(step.val||'',step.inc||false));
//         }else if(step.type==='l'){
//             const l = await tagRepository.getOne({tag:step.val});
//             console.log(step,l, step.verify === l.count);
//         }else if(step.type==='dl'){
//             for (const t of step.arr||[]) {
//                 await tagRepository.deleteOne({tag:t});
//                 console.log('deleted',t);
//             }
//         }
//     }
    
// }

import * as GoogleGeocode from 'node-library/lib/utils/google.geocoder';

GoogleGeocode.loadAPI('AIzaSyDl4dmvk0tBIX0-BWCaOZy0MjAcTtLHo60');

setTimeout(()=>{
    GoogleGeocode.reverseLookup(38.665788,-121.156467).then((result)=>{
        console.log(result);
        GoogleGeocode.reverseLookup(18.451093,79.120607).then((result)=>{
            console.log(result);
        }).catch((err)=>{console.error(err)})
    }).catch((err)=>{console.error(err)})
},3000)