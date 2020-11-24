import {PostRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';
import StatsService from './stats.service';
import { normalizeJson } from 'node-library/lib/helpers/json.helper';

class PostService extends StatsService {

    private static instance: PostService;
    
    private constructor() { 
        super(new PostRepository());
        Services.Binder.bindFunction(BinderNames.POST.CHECK.ID_EXISTS,this.checkIdExists);

        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.POST,this);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.COMMENT,this);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.OPINION,this);
    }

    public static getInstance(): PostService {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }

        return PostService.instance;
    }

    
    processMessage(message: Services.PubSub.Message) {
        switch(message.type){
            case PubSubMessageTypes.POST.READ:
                this.postRead(message.request,message.data);
                break;
            case PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request,message.data,'postId');
                break;
            case PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request,message.data,'postId');
                break;
            case PubSubMessageTypes.COMMENT.CREATED:
                this.commentCreated(message.request,message.data,'postId');
                break;
            case PubSubMessageTypes.COMMENT.DELETED:
                this.commentDeleted(message.request,message.data,'postId');
                break;
            case PubSubMessageTypes.COMMENT.CONTEXT_CHANGED:
                this.commentContextChanged(message.request,message.data,'postId');
                break;
        }
    } 
    
    postRead(request: Helpers.Request, data: any) {
        this.updateStat(request,data._id,"viewCount",true);
    }

    commentCreated = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('commentCreated',data,entityAttribute);
        if(entityAttribute in data === false)
            return;
        if(data['context']!=='general'){
            await this.updateStat(request, data[entityAttribute], `${data['context']}Count`,true);
        }
        return await this.updateStat(request, data[entityAttribute], 'commentCount',true);
    }

    commentDeleted = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('commentDeleted',data,entityAttribute);
        if(entityAttribute in data === false)
            return;
        if(data['context']!=='general'){
            await this.updateStat(request, data[entityAttribute], `${data['context']}Count`,false);
        }
        return await this.updateStat(request, data[entityAttribute], 'commentCount',false);
    }

    commentContextChanged = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('commentDeleted',data,entityAttribute);
        if(entityAttribute in data === false)
            return;
        if(data['old']!=='general'){
            await this.updateStat(request, data[entityAttribute], `${data['old']}Count`,false);
        }
        if(data['new']!=='general'){
            await this.updateStat(request, data[entityAttribute], `${data['new']}Count`,true);
        }
        return 0;
    }

    create = async(request:Helpers.Request,data) => {
        console.log('post.service',request,data);

        data.author = request.getUserId();

        data.location = data.location || request.getLocation();

        console.log('post.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.CREATED,
            data
        });

        console.log('post.service','published message');

        return (await this.embedAuthorInformation(request,[data],['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','content.title','content.tags','location','status','isDeleted','stats','createdAt','lastModifiedAt','threadLastUpdatedAt'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result,['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES));

        return data;
    }

    get = async(request:Helpers.Request, documentId: string, attributes?: any[]) => {

        const data = await this.repository.get(documentId,attributes);

        if(!data)
            this.buildError(404);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.READ,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    update = async(request:Helpers.Request,documentId:string,data) => {
        console.log('post.service',request,data);

        //data = Helpers.JSON.normalizeJson(data);

        data.lastModifiedAt = new Date();
        data.isDeleted = false;
        data.location = data.location || request.getLocation();

        console.log('post.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.UPDATED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data :any = {
            isDeleted:true
        };

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    deepEqual =  (x, y) => {
        if (x === y) {
          return true;
        }
        else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
          if (Object.keys(x).length != Object.keys(y).length)
            return false;
      
          for (var prop in x) {
            if (y.hasOwnProperty(prop))
            {  
              if (! this.deepEqual(x[prop], y[prop]))
                return false;
            }
            else
              return false;
          }
      
          return true;
        }
        else 
          return false;
      }

}

export default PostService.getInstance();