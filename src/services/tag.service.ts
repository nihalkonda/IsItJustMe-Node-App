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
            case PubSubMessageTypes.POST.TAG_CHANGED:
                this.updateTags(message.request,message.data['old'],message.data['new']);
            case PubSubMessageTypes.POST.DELETED:
                this.updateTags(message.request,message.data.content.tags,[]);

        }
    }

    updateTags = async(request:Helpers.Request,oldTags,newTags) => {
        try {
            for (let i = 0; i < oldTags.length; i++) {
                const tag = oldTags[i];
                await this.repository.updateTag(tag.mainType,tag.subType,false);
            }
            for (let i = 0; i < newTags.length; i++) {
                const tag = newTags[i];
                await this.repository.updateTag(tag.mainType,tag.subType,true);
            }
        } catch (error) {
            console.error(error);
        }
    }

}

export default TagService.getInstance();