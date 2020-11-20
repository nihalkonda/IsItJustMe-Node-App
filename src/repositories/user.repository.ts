import {Repositories} from 'node-library';
import {User} from '../models';

class UserRepository extends Repositories.BaseRepository {
    constructor(){
        super(User);
    }

    getUserByEmail = async(email : string) => {
        return await this.model.findOne({email})
    }

    getUserByUserId = async(userId : string) => {
        console.log('UserRepository','getUserByUserId',userId)
        return await this.model.findOne({userId})
    }

    updateUserByEmail = async(email : string,entity) => {
        delete entity.userId;
        delete entity.email;
        return await this.model.findOneAndUpdate({email},entity,{new:true})
    }

    updateUserByUserId = async(userId : string,entity) => {
        delete entity.userId;
        return await this.model.findOneAndUpdate({userId},entity,{new:true})
    }

}

export default UserRepository;