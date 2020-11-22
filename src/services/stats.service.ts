import {Helpers,Services} from 'node-library';
import { StatsRepository } from '../repositories';

class StatsService extends Services.AuthorService {

    constructor(repository : StatsRepository) { 
        super(repository);
    }

    updateStat = async(request:Helpers.Request, entityId:string, statType:string, increase:boolean) => {
        console.log('updateStat',entityId,statType,increase);
        return await this.repository.updateStat(entityId,statType,increase);
    }

    opinionCreated = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('opinionCreated',data,entityAttribute);
        if(!data[entityAttribute])
            return;
        return await this.updateStat(request, data[entityAttribute], data['opinionType']+'Count',true);
    }

    opinionDeleted = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('opinionCreated',data,entityAttribute);
        if(!data[entityAttribute])
            return;
        return await this.updateStat(request, data[entityAttribute], data['opinionType']+'Count',false);
    }

    commentCreated = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('commentCreated',data,entityAttribute);
        if(!data[entityAttribute])
            return;
        return await this.updateStat(request, data[entityAttribute], 'commentCount',true);
    }

    commentDeleted = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('commentDeleted',data,entityAttribute);
        if(!data[entityAttribute])
            return;
            return await this.updateStat(request, data[entityAttribute], 'commentCount',false);
    }
}

export default StatsService;