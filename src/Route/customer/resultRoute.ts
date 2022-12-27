import { ResultController } from "../../controller/customer";
import { Router, Request, Response } from 'express';

const app:any =  Router({ mergeParams: true });

const ResultRoute = [{
        method: "get",
        route: "/",
        controller: ResultController,
        action: "getInstantResult",
    },{
        method: "get",
        route: "/product",
        controller: ResultController,
        action: "getProductList",
    },{
        method: "put",
        route: "/updateResult",
        controller: ResultController,
        action: "updateMany",
    }
]

ResultRoute.forEach(route => {
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
                // res.response = err;
                // throw
                // res.message = err.message;
                console.log(err.message)
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