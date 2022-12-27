require('dotenv').config();
const rateLimit = require("express-rate-limit");
import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as cors from 'cors';
import {Request, Response} from "express";

import CustomerRoute from "./Route/customer";
import AgentRoute from "./Route/agent";
import { Error } from "./interface";

const allowedOrigins = process.env.NODE_ENV === 'production' ? ['https://wishgeeqa.netlify.app','https://admin.wishgee.com', 'https://wishgee.com'] : ['http://localhost:3001','http://localhost:3000','https://wishgee.herokuapp.com','https://wishgee-qa.herokuapp.com', 'https://wishgeeqa.netlify.app','https://admin.wishgee.com', 'https://wishgee.com']

console.log('Node is up, waiting for connection to db...')
createConnection().then(async connection => {
    console.log('connection established');
    // create express app
    const app = express();
    app.use(cors({
      origin: function(origin, callback){
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
          console.log('current origing ', origin)
          var msg = 'The CORS policy for this site does not ' +
                    'allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      }
    }));
    app.set('trust proxy', 1);
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use((req, res, next) => {
        res.statusCode = null;
        req.query.pageSize = '10',
        req.query.page = req.query.page || '1'
        req.query.agent_email = ''
        next();
    });

    //Limiting the number of request for different end point
    const productListRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 75, // limit each IP to 75 requests per windowMs
      message:"Too many request created from this IP, please try again after 15 minutes."
    });

    const fetchImmediateResultLimit = rateLimit({
      windowMs: 5 * 60 * 1000, // 15 minutes
      // max: 10, // limit each IP to 5 requests per windowMs
      max: 100, // limit each IP to 5 requests per windowMs,
      message:"Too many requests detected. Please try again after 15 minutes."
    });

    const createWishRateLimit = rateLimit({
      windowMs: 30 * 60 * 1000, // 10 minutes
      max: 2, // limit each IP to 5 requests per windowMs
      message:"Too many wish created from this IP, please try again after 30 minutes."
    });

    const customerOverallLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 3500, // limit each IP to 350 requests per windowMs,
      // max: 350, // limit each IP to 350 requests per windowMs
      message:"Too many requst created from this IP, please try again after 15 minutes."
    });
    
    app.use('/v1/customer', customerOverallLimit);
    app.use('/v1/customer/result/product', productListRateLimit);
    app.post('/v1/customer/wish', createWishRateLimit);
    app.get('/v1/customer/result', fetchImmediateResultLimit);

    //End of limiting the route

    app.use('/v1/customer', CustomerRoute);
    app.use('/v1/agent', AgentRoute);

    app.use((req: Request, res: any, next: Function) => {
        if (res.response && !res.statusCode) res.statusCode = 200;
        if (res.response || res.statusCode) {
          let resp = res.response
          if(req.method === 'GET'){
            let pageSize:number = Number(req.query.pageSize) || 1;
            resp = { contents: resp[0], totalElements: resp[1], totalPages: Math.ceil(resp[1]/pageSize)}
          }
          return res.json({
            data: resp,
            successCode: `SUCC${res.statusCode}`,
          });
        }
        next();
    });

    app.use((err: Error, req: Request, res: Response, next: Function) => {
      console.log('Error Occured ', err)
        const { statusCode, errorCode } = err;
        const status: number = statusCode || 500;
        const error: string = errorCode || 'ERR500';
        const message: string = (error === 'ERR500') ? 'Internal server error' : undefined;
        return res.status(status).json({
          error,
          message,
        });
    });

    app.use((req: Request, res: Response, next: Function) => res.status(404).json({
        message: 'Route not found',
        errorCode: 'ERR404',
    }));

    console.log('prior to connection');
    const listener = app.listen(Number(process.env.PORT) || 3000, '0.0.0.0' || '::', () => { console.log("Listentin to ", listener.address().port) });


}).catch(error => console.log(error));
