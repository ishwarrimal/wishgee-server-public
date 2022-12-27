import { WishController } from "../../controller/customer";
import { Router, Request, Response, NextFunction } from 'express';
import { APIError, veirfyCustomer } from "../../middleware";

const app:any =  Router({ mergeParams: true });

const Wish = [{
        method: "get",
        route: "/",
        controller: WishController,
        action: "all",
    },{
        method: "post",
        route: "/",
        controller: WishController,
        action: "save",
    },{
        method: "put",
        route: "/close",
        controller: WishController,
        action: "closeWish",
    }
]

app.use(async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(req.headers.authorization){
            const email:boolean|string = await veirfyCustomer(req.headers.authorization.split(' ')[1]);
            if(Boolean(email)){
                req.query.user_email = String(email);
                next();
            }else{
                next(new APIError('403'))
            }
        }else{
            next(new APIError('403'))
        }
    }
    catch(e){
        next(new APIError('403'))
    }
})

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
                // res.response = err;
                // throw
                // res.message = err.message;
                console.log('error in wish route', err.message)
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