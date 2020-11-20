import {TagService} from '../services';
import {Controllers} from 'node-library';

class TagController extends Controllers.BaseController{
    
    constructor(){
        super(TagService);
    }

}
export default TagController;