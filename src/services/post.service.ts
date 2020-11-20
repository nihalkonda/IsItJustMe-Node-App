import {PostRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';

class PostService extends Services.AuthorService {

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

    create = async(request:Helpers.Request,bodyP) => {
        console.log('post.service',request,bodyP);

        let data:any = bodyP;

        data.author = request.getUserId();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }

        console.log('post.service','db insert',data);

        data = await this.repository.create(bodyP);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.POST.CREATED,
            data
        });

        console.log('post.service','published message');

        return data;
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','published.title','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        return this.repository.getAll(query,sort,pageSize,pageNum,attributes);
    }

    update = async(request:Helpers.Request,documentId:string,bodyP) => {
        console.log('post.service',request,bodyP);

        let data :any = bodyP

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }else{
            delete data.status
        }

        data[data.status] = {
            lastModifiedAt:new Date()
        }

        //data = Helpers.JSON.normalizeJson(data);

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
            status:'deleted'
        }

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