import { Repositories } from 'node-library';
import {Comment} from '../models';

class CommentRepository extends Repositories.AuthorRepository {
    constructor(){
        super(Comment);
    }
}

export default CommentRepository;