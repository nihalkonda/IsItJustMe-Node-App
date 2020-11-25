import {Repositories} from 'node-library';
import {Tag} from '../models';

class TagRepository extends Repositories.BaseRepository {
    constructor(){
        super(Tag);
    }

    updateTag = async(mainType:string,subType:string,increment:boolean) => {
        let query = {"mainType":mainType,"subType":subType};
        
        //@ts-ignore
        return await this.model.findOneAndUpdate(query,{$set:query,$inc:{"count":increment?1:-1}},{upsert:true});
    }
}

export default TagRepository;