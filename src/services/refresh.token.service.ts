import {RefreshTokenRepository} from '../repositories';
import {Services,Helpers} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class RefreshTokenService extends Services.BaseService {

    private static instance: RefreshTokenService;
    
    public static getInstance(): RefreshTokenService {
        if (!RefreshTokenService.instance) {
            RefreshTokenService.instance = new RefreshTokenService();
        }

        return RefreshTokenService.instance;
    }

    private constructor(){
        super(new RefreshTokenRepository());
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.AUTH,this);
    }

    processMessage(message:Services.PubSub.Message){
        console.log('UserService',message);
        switch (message.type) {
            
            case PubSubMessageTypes.AUTH.USER_SIGNED_UP:
            case PubSubMessageTypes.AUTH.USER_SIGNED_IN:
            case PubSubMessageTypes.AUTH.USER_CONFIRMED:
                this.refreshTokenCreate(message);
                break;

            case PubSubMessageTypes.AUTH.USER_SIGN_OUT:
            case PubSubMessageTypes.AUTH.USER_SIGN_OUT_ALL:
                this.refreshTokenDelete(message);
                break;
        
            default:
                break;
                
        }
    }

    refreshTokenCreate(message: Services.PubSub.Message) {
        const {
            userId,
            refreshToken,
            ip
        } = message.data;

        this.repository.create({
            userId,
            refreshToken,
            ip
        });
    }

    refreshTokenDelete(message: Services.PubSub.Message) {
        const {
            userId,
            refreshToken,
            ip
        } = message.data;
        
        if(userId){
            this.repository.removeAllByUserId(userId);
        }else if(refreshToken){
            this.repository.removeByRefreshToken(refreshToken.value);
        }
    }

    async getActiveRefreshTokenCount(request:Helpers.Request) {
        return await this.repository.getActiveRefreshTokenCount(request.getTokenValue());
    }

}

export default RefreshTokenService.getInstance();