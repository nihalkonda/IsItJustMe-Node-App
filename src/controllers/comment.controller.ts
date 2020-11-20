import {CommentService} from '../services';
import {Controllers} from 'node-library';

class CommentController extends Controllers.BaseController{
    
    constructor(){
        super(CommentService);
    }

}
export default CommentController;