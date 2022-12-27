import { WishController } from "../../controller/agent";
import { Router, Request, Response } from 'express';

const app:any =  Router({ mergeParams: true });

const Wish = [{
        method: "get",
        route: "/reviewed",
        controller: WishController,
        action: "all",
    },{
        method: "get",
        route: "/open",
        controller: WishController,
        action: "all",
    },{
        method: "get",
        route: "/waiting_for_approval",
        controller: WishController,
        action: "all",
    },{
        method: "get",
        route: "/closed",
        controller: WishController,
        action: "all",
    },{
        method: "get",
        route: "/recommendation",
        controller: WishController,
        action: "allRecommendation",
    },{
        method: "post",
        route: "/recommendation",
        controller: WishController,
        action: "saveRecommendation",
    },{
        method: "put",
        route: "/",
        controller: WishController,
        action: "update",
    },
    {
        method: "delete",
        route: "/recommendation",
        controller: WishController,
        action: "deleteRecommendation",
    },
]

Wish.forEach(route => {
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
                next();
            })
        } else if (result !== null && result !== undefined) {
            res.response = result
            res.status(200);
            next();
        }
    });
});

export default app;