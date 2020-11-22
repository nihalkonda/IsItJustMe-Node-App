import {PostRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';
import StatsService from './stats.service';

class PostService extends StatsService {

    private static instance: PostService;
    
    private constructor() { 
        super(new PostRepository());
        Services.Binder.bindFunction(BinderNames.POST.CHECK.ID_EXISTS,this.checkIdExists);
    }

    public static getInstance(): PostService {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }

        return PostService.instance;
    }

    create = async(request:Helpers.Request,data) => {
        console.log('post.service',request,data);

        data.author = request.getUserId();

        console.log('post.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.CREATED,
            data
        });

        console.log('post.service','published message');

        return data;
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','content.title','content.tags','location','status','isDeleted','stats','createdAt','lastModifiedAt','threadLastUpdatedAt'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        return this.repository.getAll(query,sort,pageSize,pageNum,attributes);
    }

    update = async(request:Helpers.Request,documentId:string,data) => {
        console.log('post.service',request,data);

        //data = Helpers.JSON.normalizeJson(data);

        data.lastModifiedAt = new Date();
        data.isDeleted = false;

        console.log('post.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.UPDATED,
            data
        });

        return data;
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

        return data;
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

    updateStat = async(request:Helpers.Request, entityId, statType, increase:boolean) => {
        this.repository.updateStat(entityId,statType,increase);
    }

}

export default PostService.getInstance();