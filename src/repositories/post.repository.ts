import {Post} from '../models';
import { Repositories } from 'node-library';
import StatsRepository from './stats.repository';

class PostRepository extends StatsRepository {
    constructor(){
        super(Post);
    }
}

export default PostRepository;