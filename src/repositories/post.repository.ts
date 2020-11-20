import {Post} from '../models';
import { Repositories } from 'node-library';

class PostRepository extends Repositories.AuthorRepository {
    constructor(){
        super(Post);
    }
}

export default PostRepository;