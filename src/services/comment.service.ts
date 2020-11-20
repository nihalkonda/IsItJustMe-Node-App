import {CommentRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';

class CommentService extends Services.AuthorService {

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

    create = async(request:Helpers.Request,bodyP) => {
        console.log('comment.service',request,bodyP);

        const postIdExists = await Services.Binder.boundFunction(BinderNames.POST.CHECK.ID_EXISTS)(request,bodyP.postId)
        console.log('comment.service','create','postIdExists',postIdExists)
        if(!postIdExists)
            throw this.buildError(404,'postId not available')

        let data:any = bodyP;

        data.author = request.getUserId();

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

    update = async(request:Helpers.Request,documentId:string,bodyP) => {
        console.log('comment.service',request,bodyP);

        let data :any = bodyP;

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data = await this.repository.delete(documentId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.DELETED,
            data
        });

        return data;
    }
}

export default CommentService.getInstance();