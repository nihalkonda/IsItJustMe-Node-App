import {CommentRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';
import StatsService from './stats.service';

class CommentService extends StatsService {

    private static instance: CommentService;
    
    private constructor() { 
        super(new CommentRepository());
    }

    public static getInstance(): CommentService {
        if (!CommentService.instance) {
            CommentService.instance = new CommentService();
        }

        return CommentService.instance;
    }

    create = async(request:Helpers.Request,data) => {
        console.log('comment.service',request,data);

        data.postId = request.raw.params['postId'];

        const post = await Services.Binder.boundFunction(BinderNames.POST.CHECK.ID_EXISTS)(request,data.postId)
        
        console.log('comment.service','create','postIdExists',post)

        if(!post)
            throw this.buildError(404,'postId not available')

        data.author = request.getUserId();

        if(data.context==='resolved'){
            if(data.author !== post.author)
                throw this.buildError(400,'Since you are not the author of the post, you are not allowed to post resolved comments on the post.')
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.CREATED,
            data
        });

        console.log('comment.service','published message');

        return data;
    }

    update = async(request:Helpers.Request,documentId:string,data) => {
        console.log('comment.service',request,data);

        data = Helpers.JSON.normalizeJson(data);
        data.isDeleted = false;

        console.log('comment.service','db update',data);

        data = await this.repository.updateOnePartial({
            _id:documentId,
            postId:request.raw.params['postId']
        },data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data :any = {
            isDeleted:true
        };

        data = await this.repository.updateOnePartial({
            _id:documentId,
            postId:request.raw.params['postId']
        },data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.DELETED,
            data
        });

        return data;
    }
}

export default CommentService.getInstance();