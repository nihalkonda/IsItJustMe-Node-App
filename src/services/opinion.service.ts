import {OpinionRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';

class OpinionService extends Services.AuthorService {

    private static instance: OpinionService;
    
    private constructor() { 
        super(new OpinionRepository());
    }

    public static getInstance(): OpinionService {
        if (!OpinionService.instance) {
            OpinionService.instance = new OpinionService();
        }

        return OpinionService.instance;
    }

    create = async(request:Helpers.Request,data) => {
        console.log('opinion.service',request,data);

        data.postId = request.raw.params['postId'];
        data.commentId = request.raw.params['commentId']||'none';

        const post = await Services.Binder.boundFunction(BinderNames.POST.CHECK.ID_EXISTS)(request,data.postId)
        
        console.log('comment.service','create','postIdExists',post)

        if(!post)
            throw this.buildError(404,'postId not available')

        if(data.commentId !== 'none'){
            const comment = await Services.Binder.boundFunction(BinderNames.COMMENT.CHECK.ID_EXISTS)(request,data.commentId);
            console.log('comment.service','create','commentIdExists',comment)

            if(!comment)
                throw this.buildError(404,'commentId not available')

            if(comment.postId !== data.postId)
                throw this.buildError(404,'commentId not available under the postId')
        }

        data.author = request.getUserId();

        let response = await this.getAll(request,{
            author:data.author,
            postId:data.postId,
            commentId:data.commentId
        },100);

        if(response.resultSize>0){
            for(const opinion of response.result){
                if(data.opinionType === opinion.opinionType){
                    return opinion;
                }
                if(
                    (data.opinionType === 'upvote' && opinion.opinionType === 'downvote')
                    ||
                    (data.opinionType === 'downvote' && opinion.opinionType === 'upvote')
                ){
                    await this.delete(request,opinion._id);
                }
            }
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('opinion.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.CREATED,
            data
        });

        console.log('opinion.service','published message');

        return data;
    }


    delete = async(request:Helpers.Request,documentId) => {
        const postId = request.raw.params['postId'];
        const commentId = request.raw.params['commentId']||'none';

        const query :any = {
            postId,
            commentId,
            _id:documentId
        };

        let data = await this.repository.deleteOne(query);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.DELETED,
            data
        });

        return data;
    }
}

export default OpinionService.getInstance();