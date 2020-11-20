import * as express from 'express';
import { Router } from 'express';
import { Middlewares } from 'node-library';
import { UserController } from '../controllers'

const router = Router()

const userController = new UserController()

//router.post('/',LoggerMiddleware('v1'),userController.create)

router.post('/search',Middlewares.authCheck(false),userController.getAll)

router.put('/',Middlewares.authCheck(true),userController.update)

router.get('/me',Middlewares.authCheck(true),userController.getMe)

router.get('/:id',Middlewares.authCheck(false),userController.getId)

export default router;