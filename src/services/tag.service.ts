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
            case PubSubMessageTypes.POST.UPDATED:
                
        }
    }

}

export default TagService.getInstance();