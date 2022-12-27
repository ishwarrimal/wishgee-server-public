import { Router, Request, Response, query } from 'express';

import { UserController } from "../../controller/agent";

const app:any =  Router({ mergeParams: true });

const UserRoute = [{
        method: "get",
        route: "/",
        controller: UserController,
        action: "all",
    },
    {
        method: "post",
        route: "/",
        controller: UserController,
        action: "save",
    },
    {
        method: 'put',
        route: '/',
        controller: UserController,
        action: "update"
    }
]

UserRoute.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: any, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            result.then(result => {
                if(result !== null && result !== undefined){
                    res.response = result;
                    res.status(200);
                    next();
                }
            }).catch(err => {
                console.log(err.message)
                err.errorCode = "400";
                next();
            })
        } else if (result !== null && result !== undefined) {
            res.response = result;
            res.status(200);
            next();
        }
    });
});

export default app;