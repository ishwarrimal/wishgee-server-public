import { Router, Request, Response } from 'express';
const app:any =  Router({ mergeParams: true });
import WishTrendRoute from './wishTrendRoute';
import UserRoute from './userRoute';
import ResultRoute from './resultRoute';
import ProductTypeRoute from './productTypeRoute';
import WishRoute from './wishRoute';
import { APIError, veirfyAgent } from '../../middleware';

app.use(async (req: Request, res: any, next) => {
    try{
        if(req.headers.authorization){
            const email:boolean|string = await veirfyAgent(req.headers.authorization.split(' ')[1]);
            if(Boolean(email)){
                req.query.agent_email = String(email);
                next();
            }else{
                next(new APIError('403'))
            }
        }
    }catch{
        next(new APIError('403'))
    }
})
app.use('/wish-trend', WishTrendRoute);
app.use('/user', UserRoute);
app.use('/result', ResultRoute);
app.use('/wish', WishRoute);
app.use('/product-type', ProductTypeRoute)

export default app;