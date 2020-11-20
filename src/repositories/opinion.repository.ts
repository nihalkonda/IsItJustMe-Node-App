import {Opinion} from '../models';
import { Repositories } from 'node-library';

class OpinionRepository extends Repositories.AuthorRepository {
    constructor(){
        super(Opinion);
    }
}

export default OpinionRepository;