import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
const { WebClient } = require('@slack/web-api');
import {Result, User, Wish} from "../../entity";
import { recommendation_type, wish_status } from "../../entity/wishEntity";
import { MailHelper, MailType } from "../../utils";

const sendWishCreatedToSlack = async ({product, price, features}) => {
    const web = new WebClient(process.env.SLACK_TOKEN);
    try{
        await web.chat.postMessage({
            channel: '#wish_fulfillment',
            text: `New wish created. Product: ${product}, price : ${price}, features: ${features}`
        })
    }catch(err){
        console.log('error sending message to slack ',err);
    }
}

export default class WishController {

    private WishRepository = getRepository(Wish);
    private UserRepository = getRepository(User);
    private ResultRepository = getRepository(Result);

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take, user_email }: any = request.query || {}
        const user = await this.UserRepository.findOne({where: {email: user_email}});
        const skip:number = (page-1) * take;
        return this.WishRepository.createQueryBuilder("wish")
                    .select(["wish", "result"])
                    .where('wish.customer_id = :id', {id: user.id})
                    .leftJoin('wish.result', 'result')
                    .leftJoinAndMapOne("wish.customer", User, "user", "user.id = wish.customer_id")
                    .leftJoinAndMapOne("wish.agent", User, "agent", "agent.id = wish.agent_id")
                    .take(take)
                    .skip(skip)
                    .orderBy('wish.updated','DESC')
                    .getManyAndCount()
    }

    async bestRecommendation(req: Request, res: Response, next: NextFunction) {
        const { page, pageSize: take }: any= req.query || {}
        const skip:number = (page-1) * take;
        return this.WishRepository.createQueryBuilder("wish")
                    .select(["wish", "result"])
                    .where('wish.recommendation_type = :type', {type: recommendation_type.agent_created})
                    .andWhere('wish.status IN(:...status)', {status: [wish_status.resolved, wish_status.closed]})
                    .andWhere('result.product_price >= 0')
                    .leftJoin('wish.result', 'result')
                    .take(take)
                    .skip(skip)
                    .orderBy('wish.updated','DESC')
                    .getManyAndCount();
    }

    async latestRecommendation(req: Request, res: Response, next: NextFunction) {
        const { page, pageSize: take }: any= req.query || {}
        const skip:number = (page-1) * take;
        return this.WishRepository.createQueryBuilder("wish")
                    .select(["wish", "result"])
                    .where('wish.recommendation_type = :type', {type: recommendation_type.user_created})
                    .andWhere('wish.status = :status', {status: wish_status.resolved})
                    .andWhere('result.product_price > :zero', {zero: 0})
                    .leftJoin('wish.result', 'result')
                    .take(take)
                    .skip(skip)
                    .orderBy('wish.updated','DESC')
                    .getManyAndCount();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.WishRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const { user_email } = request.query;
        const user = await this.UserRepository.createQueryBuilder("customer").select(["customer"]).where({email:user_email}).getOne();
        const result = await this.ResultRepository.save({product_type: request.body.title})
        request.body.customer_id = user.id;
        request.body.recommendation_type = recommendation_type.user_created;
        request.body.result = result;
        const wishCreated = await this.WishRepository.save(request.body);
        // If wish created, send a mail and update wish count
        if(wishCreated && wishCreated.title){
            process.env.NODE_ENV === "production" && sendWishCreatedToSlack({product: wishCreated.title, price: wishCreated.max_budget, features: wishCreated.keywords})
            MailHelper({useEmail: user_email, userName: user.username, productName: request.body.title, type: MailType.wishSubmit})
            // console.log(71, wishCreated)
            const toUpdate = { total_wish_count: Number(user.total_wish_count)+1, open_wish_count: Number(user.open_wish_count)+1}
            this.UserRepository
                    .createQueryBuilder()
                    .update(User)
                    .set(toUpdate)
                    .where("id = :id", {id : user.id})
                    .execute();
        }
        return wishCreated
    }

    async closeWish(request: Request, response: Response, next: NextFunction) {
        const { user_email } = request.query;
        const user = await this.UserRepository.createQueryBuilder("customer").select(["customer"]).where({email:user_email}).getOne();
        const id = request.query.id;
        const toUpdate:any = {status: wish_status.closed}
        const closedWish = await this.WishRepository
                        .createQueryBuilder()
                        .update()
                        .set(toUpdate)
                        .where('id = :id', {id})
                        .execute()
        if(closedWish){
            const toUpdate = { open_wish_count: Number(user.open_wish_count)-1}
            this.UserRepository
                    .createQueryBuilder()
                    .update(User)
                    .set(toUpdate)
                    .where("id = :id", {id : user.id})
                    .execute();
        }
        return closedWish;
    }

}