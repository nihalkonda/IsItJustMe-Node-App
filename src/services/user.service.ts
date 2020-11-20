import {UserRepository} from '../repositories';
import {Services,Helpers} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class UserService extends Services.BaseService{

    private static instance: UserService;
    
    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

    private constructor(){
        super(new UserRepository());
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.AUTH.USER_SIGNED_UP,this)
    }

    processMessage(message: Services.PubSub.Message){
        console.log('UserService',message);
        switch (message.type) {
            case PubSubMessageTypes.AUTH.USER_SIGNED_UP:
                this.userCreated(message);
                break;
        
            default:
                break;
        }
    }

    userCreated(event: Services.PubSub.Message) {

        const {
            userId,
            email,
            firstName,
            lastName
        } = event.data;
        
        this.create(event.request,{
            _id:userId,
            email,
            firstName,
            lastName
        });

    }

    getUserByEmail = async(request:Helpers.Request,email) => {
        return await this.repository.getUserByEmail(email);
    }

    getUserByUserId = async(request:Helpers.Request,userId) => {
        return await this.repository.getUserByUserId(userId);
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['userId','email','firstName','lastName','displayPicture'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        return this.repository.getAll(query,sort,pageSize,pageNum,attributes);
    }

    update = async(request:Helpers.Request, entityId, body) =>{
        const {
            email,
            firstName,
            lastName,
            displayPicture
        } = body;

        return await this.repository.updateUserByUserId(request.getUserId(),Helpers.JSON.normalizeJson({
            email,
            firstName,
            lastName,
            displayPicture
        }));
    }
}

export default UserService.getInstance();