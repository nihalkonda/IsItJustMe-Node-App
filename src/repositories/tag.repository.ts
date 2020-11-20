import {Repositories} from 'node-library';
import {Tag} from '../models';

class TagRepository extends Repositories.BaseRepository {
    constructor(){
        super(Tag);
    }
}

export default TagRepository;