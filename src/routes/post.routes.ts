import { Router } from 'express';
import { Helpers, Middlewares,Services } from 'node-library';
import { PostController } from '../controllers';
import CommentRoutes from './comment.routes';
import OpinionRoutes from './opinion.routes';

const router = Router()

const controller = new PostController();

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware();

const schema = {
    "type": "object",
    "additionalProperties": false,
    "required": ["title","content","tags","location"],
    "properties": {
        "title":{
            "type":"string"
        },
        "content":{
            "type":"string"
        },
        "tags":{
            "type":"array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["maintype","subtype"],
                "properties":{
                    "maintype":{
                        "type":"string"
                    },
                    "subtype":{
                        "type":"string"
                    }
                }
            }
        },
        "location":{
            "type":"object",
            "additionalProperties": true,
            "required": ["latitude","longitude"],
            "properties":{
                "latitude":{
                    "type":"number"
                },
                "longitude":{
                    "type":"number"
                }
            }
        }
    }
};

router.param('id',Middlewares.addParamToRequest());

router.param('postId',Middlewares.addParamToRequest());

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody(schema),controller.create)

router.post('/search',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),Middlewares.checkDocumentExists(authorService,'id'),controller.get)

router.put('/:id',Middlewares.authCheck(true),Middlewares.checkDocumentExists(authorService,'id'),Middlewares.isAuthor(authorService),validatorMiddleware.validateRequestBody(schema),controller.update)

router.delete('/:id',Middlewares.authCheck(true),Middlewares.checkDocumentExists(authorService,'id'),Middlewares.isAuthor(authorService),controller.delete)

router.use('/:postId/comment',Middlewares.checkDocumentExists(authorService,'postId'),CommentRoutes);
router.use('/:postId/opinion',Middlewares.checkDocumentExists(authorService,'postId'),OpinionRoutes);

export default router;