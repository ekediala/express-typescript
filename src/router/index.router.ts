import { ROUTES } from '../constants/index.constants';
import { Router } from 'express';
import { invalidRoute, testRoute } from '../helpers/index.helpers';
import { userRouter } from './user.router';

const { WILD_CARD, HOME } = ROUTES;

// router for testing if api is live
const testRouter = Router();
testRouter.all(HOME, testRoute);

// handle unknown routes in the api domain
const invalidRoutes = Router();
invalidRoutes.all(WILD_CARD, invalidRoute);

const versionOneRouter = [testRouter, userRouter, invalidRoutes];

export default versionOneRouter;
