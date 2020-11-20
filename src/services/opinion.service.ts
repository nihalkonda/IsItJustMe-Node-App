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

        const postIdExists = await Services.Binder.boundFunction(BinderNames.POST.CHECK.ID_EXISTS)(request,data.postId)
        console.log('opinion.service','create','postIdExists',postIdExists)
        
        if(!postIdExists)
            throw this.buildError(404,'postId not available')

        data.author = request.getUserId();

        let response = await this.getAll(request,{
            author:data.author,
            postId:data.postId
        },100);

        if(response.resultSize>0){
            for(const opinion of response.result){
                if(data.opinionType === opinion.opinionType){
                    throw this.buildError(200,opinion);
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


    delete = async(request:Helpers.Request,entityId) => {
        let data = await this.repository.delete(entityId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.DELETED,
            data
        });

        return data;
    }
}

export default OpinionService.getInstance();