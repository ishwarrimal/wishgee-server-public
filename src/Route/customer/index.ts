import { Router, Request, Response } from 'express';
const app:any =  Router({ mergeParams: true });
import WishTrendRoute from './wishTrendRoute';
import UserRoute from './userRoute';
import ResultRoute from './resultRoute';
import WishRoute from './wishRoute';
import WishRecommendation from './wishRecommendationRoute';
import ProductType from './productTypeRoute';

app.use('/wish-trend', WishTrendRoute);
app.use('/user', UserRoute);
app.use('/result', ResultRoute);
app.use('/wish', WishRoute);
app.use('/recommendation', WishRecommendation);
app.use('/product-type', ProductType)

export default app;