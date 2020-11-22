import { Router } from 'express';
import { Middlewares,Services } from 'node-library';
import { OpinionController } from '../controllers';

const router = Router()

const controller = new OpinionController();

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware();

router.post('/',
            Middlewares.authCheck(true),
            validatorMiddleware.validateRequestBody({
                "type": "object",
                "additionalProperties": false,
                "required": ["opinionType"],
                "properties": {
                    "body":{
                        "type":"string"
                    },
                    "opinionType":{
                        "type":"string",
                        "enum":['follow','upvote','downvote','spamreport']
                    },
                    "customAttributes":{
                        "type":"object"
                    }
                }
            }),controller.create)

router.post('/search',
            Middlewares.authCheck(false),
            controller.getAll)

router.get('/:id',
            Middlewares.authCheck(false),
            controller.get)

router.delete('/:id',
            Middlewares.authCheck(true),
            Middlewares.isAuthor(authorService),
            controller.delete)

export default router;