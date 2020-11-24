import {Helpers,Services} from 'node-library';
import { normalizeJson } from 'node-library/lib/helpers/json.helper';
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
        console.log('opinionCreated',data,entityAttribute,data[entityAttribute]);
        if(entityAttribute in data === false){
            console.log('opinionCreated',entityAttribute,'nope');
            return;
        }
        return await this.updateStat(request, data[entityAttribute], data['opinionType']+'Count',true);
    }

    opinionDeleted = async(request:Helpers.Request, data:any, entityAttribute:string) => {
        console.log('opinionDeleted',data,entityAttribute,data[entityAttribute]);
        if(entityAttribute in data === false)
            return;
        return await this.updateStat(request, data[entityAttribute], data['opinionType']+'Count',false);
    }

}

export default StatsService;