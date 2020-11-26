import {TagRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class TagService extends Services.BaseService {

    private static instance: TagService;
    
    private constructor() { 
        super(new TagRepository());
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.POST,this);
    }

    public static getInstance(): TagService {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }

        return TagService.instance;
    }

    processMessage(message: Services.PubSub.Message){
        switch(message.type){
            case PubSubMessageTypes.POST.CREATED:
                this.updateTags(message.request,[],message.data.content.tags);
                break;
            case PubSubMessageTypes.POST.TAG_CHANGED:
                this.updateTags(message.request,message.data['deleted'],message.data['added']);
                break
            case PubSubMessageTypes.POST.DELETED:
                this.updateTags(message.request,message.data.content.tags,[]);
                break
        }
    }

    updateTags = async(request:Helpers.Request,oldTags:string[],newTags:string[]) => {
        try {
            if(oldTags.length > 0)
            for (let i = 0; i < oldTags.length; i++) {
                await this.repository.updateTag(oldTags[i],false);
            }

            if(newTags.length > 0)
            for (let i = 0; i < newTags.length; i++) {
                await this.repository.updateTag(newTags[i],true);
            }
        } catch (error) {
            console.error(error);
        }
    }

}

export default TagService.getInstance();