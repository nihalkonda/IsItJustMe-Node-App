import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as GoogleGeocode from 'node-library/lib/utils/google.geocoder';

import {Middlewares} from 'node-library';

import {RefreshTokenService} from '../services';

const app: express.Application = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(Middlewares.logger('v1'));
app.use(Middlewares.requestProcessor(RefreshTokenService));

GoogleGeocode.loadAPI('AIzaSyDl4dmvk0tBIX0-BWCaOZy0MjAcTtLHo60');

export default app;