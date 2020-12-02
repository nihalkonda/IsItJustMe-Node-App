import { PostRepository } from '../repositories';
import { Helpers, Services } from 'node-library';
import { PubSubMessageTypes } from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';
import StatsService from './stats.service';
import { normalizeJson } from 'node-library/lib/helpers/json.helper';

class PostService extends StatsService {

    private static instance: PostService;

    private constructor() {
        super(new PostRepository());
        Services.Binder.bindFunction(BinderNames.POST.CHECK.ID_EXISTS, this.checkIdExists);

        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.POST, this);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.COMMENT, this);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.OPINION, this);
    }

    public static getInstance(): PostService {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }

        return PostService.instance;
    }

    processMessage(message: Services.PubSub.Message) {
        switch (message.type) {
            case PubSubMessageTypes.POST.READ:
                this.postRead(message.request, message.data);
                break;
            case PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request, message.data, 'postId');
                break;
            case PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request, message.data, 'postId');
                break;
            case PubSubMessageTypes.COMMENT.CREATED:
                this.commentStats(message.request, message.data, 'postId', true);
                break;
            case PubSubMessageTypes.COMMENT.DELETED:
                this.commentStats(message.request, message.data, 'postId', false);
                break;
            case PubSubMessageTypes.COMMENT.CONTEXT_CHANGED:
                this.commentContextChanged(message.request, message.data, 'postId');
                break;
        }
    }

    postRead(request: Helpers.Request, data: any) {
        this.updateStatMany(request, data._id, [{ property: "viewCount", increase: 1 }]);
    }

    commentStats = async (request: Helpers.Request, data: any, entityAttribute: string, increased: boolean) => {
        console.log('commentStats', data, entityAttribute, increased);

        if (entityAttribute in data === false)
            return;

        const statsMap: { [key: string]: string[] } = {
            'general': ['comment'],
            'update': ['comment', 'update'],
            'resolve': ['comment', 'resolve']
        };

        const stats: { property: string, increase: number }[] = [];

        statsMap[data['context']].forEach((sm) => {
            stats.push({ property: `${sm}Count`, increase: increased ? 1 : -1 });
        })

        return await this.updateStatMany(request, data[entityAttribute], stats);
    }

    commentContextChanged = async (request: Helpers.Request, data: any, entityAttribute: string) => {
        console.log('commentContextChanged', data, entityAttribute);

        if (entityAttribute in data === false)
            return;

        let stats: { property: string, increase: number }[] = [];

        // const statsMap:{[key:string]:string[]} = {
        //     'general':['comment'],
        //     'update':['comment','update'],
        //     'resolve':['comment','resolve']
        // };

        // g g *
        // g u +u
        if (data['old'] === 'general' && data['new'] === 'update')
            stats = [{ property: 'updateCount', increase: 1 }];
        // g r +r
        if (data['old'] === 'general' && data['new'] === 'resolve')
            stats = [{ property: 'resolveCount', increase: 1 }];
        // u g -u
        if (data['old'] === 'update' && data['new'] === 'general')
            stats = [{ property: 'updateCount', increase: -1 }];
        // u u *
        // u r -u +r
        if (data['old'] === 'update' && data['new'] === 'resolve')
            stats = [{ property: 'updateCount', increase: -1 }, { property: 'resolveCount', increase: 1 }];
        // r g -r
        if (data['old'] === 'resolve' && data['new'] === 'general')
            stats = [{ property: 'resolveCount', increase: -1 }];
        // r u +u -r
        if (data['old'] === 'resolve' && data['new'] === 'update')
            stats = [{ property: 'updateCount', increase: 1 }, { property: 'resolveCount', increase: -1 }];
        // r r *  

        // const propInc = {
        //     'comment':0,'update':0,'resolve':0
        // };

        // statsMap[data['old']].forEach((sm)=>{
        //     propInc[sm] -= 1;
        // })

        // statsMap[data['new']].forEach((sm)=>{
        //     propInc[sm] += 1;
        // })

        // Object.keys(propInc).forEach((k)=>{
        //     if(propInc[k]!==0)
        //         stats.push({property:`${k}Count`,increase:propInc[k]})
        // })

        return await this.updateStatMany(request, data[entityAttribute], stats);
    }

    sanitizeTags = (tags: string[]) => {
        return [...new Set(tags.map((tag: string) => tag.trim().toLowerCase().replace(/  +/g, ' ')))];
    }

    embedTagInformation = async (request: Helpers.Request, arr: any[] = []) => {
        console.log('embedTagInformation', arr)

        try {
            if (arr.length === 0)
                return arr;

            const tags = {};
            //content.tags
            arr.forEach((a) => {
                a.content.tags.forEach((at) => {
                    tags[at] = {};
                })
            })

            const tagInfos = await Services.Binder.boundFunction(BinderNames.TAG.EXTRACT.TAG_LIST)(Object.keys(tags));

            tagInfos.forEach((tagInfo) => {
                tagInfo = JSON.parse(JSON.stringify(tagInfo));
                tags[tagInfo['tag']] = tagInfo;
            })

            console.log('embedTagInformation', tags);

            for (let i = 0; i < arr.length; i++) {
                arr[i] = JSON.parse(JSON.stringify(arr[i]));
                arr[i]['content']['tags'] = arr[i]['content']['tags'].map(tag => tags[tag]);
            }

            console.log('embedTagInformation', arr);

        } catch (error) {
            console.error(error)
        }

        return arr;
    }

    create = async (request: Helpers.Request, data) => {
        console.log('post.service', request, data);

        data.author = request.getUserId();

        data.location = data.location || request.getLocation();

        data.location.raw = data.location.raw || request.getLocation().raw;

        data.content.tags = this.sanitizeTags(data.content.tags);

        console.log('post.service', 'db insert', data);

        try {
            data = await this.repository.create(data);
        } catch (error) {
            throw this.buildError(400, error);
        }

        Services.PubSub.Organizer.publishMessage({
            request,
            type: PubSubMessageTypes.POST.CREATED,
            data
        });

        console.log('post.service', 'published message');

        data = (await this.embedAuthorInformation(request, [data], ['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];

        data = (await this.embedTagInformation(request, [data]))[0];

        return data;
    }

    getAll = async (request: Helpers.Request, query = {}, sort = {}, pageSize: number = 5, pageNum: number = 1, attributes: string[] = []) => {
        const exposableAttributes = ['author', 'content.title', 'content.tags', 'location', 'status', 'isDeleted', 'stats', 'createdAt', 'lastModifiedAt', 'threadLastUpdatedAt'];
        if (attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter(function (el: string) {
                return exposableAttributes.includes(el);
            });
        const data = await this.repository.getAll(query, sort, pageSize, pageNum, attributes);

        data.result = await this.embedAuthorInformation(request, data.result, ['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES));

        data.result = await this.embedTagInformation(request, data.result);

        return data;
    }

    get = async (request: Helpers.Request, documentId: string, attributes?: any[]) => {

        let data = await this.repository.get(documentId, attributes);

        if (!data)
            this.buildError(404);

        if (request.raw.query['full']) {
            Services.PubSub.Organizer.publishMessage({
                request,
                type: PubSubMessageTypes.POST.READ,
                data
            });
        }

        data = (await this.embedAuthorInformation(request, [data], ['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];

        data = (await this.embedTagInformation(request, [data]))[0];

        console.log(data);

        return data;
    }

    update = async (request: Helpers.Request, documentId: string, data) => {
        console.log('post.service', request, data);

        data.lastModifiedAt = new Date();
        data.isDeleted = false;
        //data.location = data.location || request.getLocation();

        data.content.tags = this.sanitizeTags(data.content.tags);

        console.log('post.service', 'db update', data);

        const old = await this.repository.get(documentId);

        if (!old)
            throw this.buildError(404, 'postId not found');



        try {
            data = await this.repository.updatePartial(documentId, data);
        } catch (error) {
            throw this.buildError(400, error);
        }

        Services.PubSub.Organizer.publishMessage({
            request,
            type: PubSubMessageTypes.POST.UPDATED,
            data
        });

        const { added, deleted, tagsChanged } = this.tagsChanged(old.content.tags, data.content.tags);
        if (tagsChanged) {
            Services.PubSub.Organizer.publishMessage({
                request,
                type: PubSubMessageTypes.POST.TAG_CHANGED,
                data: {
                    added,
                    deleted
                }
            })
        }

        data = (await this.embedAuthorInformation(request, [data], ['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];

        data = (await this.embedTagInformation(request, [data]))[0];

        return data;
    }

    delete = async (request: Helpers.Request, documentId: string) => {
        let data: any = {
            isDeleted: true
        };

        try {
            data = await this.repository.updatePartial(documentId, data);
        } catch (error) {
            throw this.buildError(400, error);
        }

        Services.PubSub.Organizer.publishMessage({
            request,
            type: PubSubMessageTypes.POST.DELETED,
            data
        });

        data = (await this.embedAuthorInformation(request, [data], ['author'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];

        data = (await this.embedTagInformation(request, [data]))[0];

        return data;
    }

    tagsChanged = (oldTags: string[], newTags: string[]) => {
        const oldSet = new Set(oldTags);
        const newSet = new Set(newTags);

        oldSet.forEach((o) => {
            if (newSet.delete(o))
                oldSet.delete(o)
        })

        return { deleted: [...oldSet], added: [...newSet], tagsChanged: (oldSet.size > 0 || newSet.size > 0) }
    }

    deepEqual = (x, y) => {
        if (x === y) {
            return true;
        }
        else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
            if (Object.keys(x).length != Object.keys(y).length)
                return false;

            for (var prop in x) {
                if (y.hasOwnProperty(prop)) {
                    if (!this.deepEqual(x[prop], y[prop]))
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