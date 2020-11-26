import {Repositories} from 'node-library';
import {Tag} from '../models';

class TagRepository extends Repositories.BaseRepository {
    constructor(){
        super(Tag);
    }

    updateTag = async(tag:string,increment:boolean) => {
        //@ts-ignore
        return await this.model.findOneAndUpdate({tag},{$set:{tag},$inc:{count:increment?1:-1}},{upsert:true});
    }
}

export default TagRepository;