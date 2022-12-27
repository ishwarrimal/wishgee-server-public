import { UserController } from "../../controller/customer";
import { Router, Request, Response } from 'express';

const app:any =  Router({ mergeParams: true });

const UserRoute = [,
    {
        method: "post",
        route: "/register",
        controller: UserController,
        action: "save",
    },
    {
        method: "get",
        route: "/testServer",
        controller: UserController,
        action: "testServer"
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