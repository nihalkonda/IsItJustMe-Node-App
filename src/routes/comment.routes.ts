import { Router } from 'express';
import { Middlewares,Services } from 'node-library';
import { CommentController } from '../controllers';

const router = Router()

const controller = new CommentController();

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware();

const schema = {
    "type": "object",
    "additionalProperties": false,
    "required": ["content","context"],
    "properties": {
        "content":{
            "type":"string"
        },
        "context":{
            "type":"string"
        }
    }
};

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody(schema),controller.create);

router.post('/search',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),Middlewares.isAuthor(authorService),validatorMiddleware.validateRequestBody(schema),controller.update)

router.delete('/:id',Middlewares.authCheck(true),Middlewares.isAuthor(authorService),controller.delete)

export default router;