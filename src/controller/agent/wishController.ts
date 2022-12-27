import {getRepository, getConnection, Connection} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Result, User, Wish} from "../../entity";
import { wish_status, recommendation_type } from '../../entity/wishEntity'
import { MailHelper, MailType } from "../../utils";

export default class WishController {

    private WishRepository = getRepository(Wish);
    protected UserRepository = getRepository(User);
    protected ResultRepository = getRepository(Result);

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take }: any= request.query || {}
        const skip:number = (page-1) * take;
        let { path: status } = request.route;
        status = wish_status[status.substring(1)];
        return this.WishRepository.createQueryBuilder("wish")
                    .select(["wish", "result"])
                    .where('wish.status = :status', {status })
                    .andWhere('wish.recommendation_type = :type', {type: recommendation_type.user_created})
                    .leftJoin('wish.result', 'result')
                    .leftJoinAndMapOne("wish.customer", User, "user", "user.id = wish.customer_id")
                    .leftJoinAndMapOne("wish.agent", User, "agent", "agent.id = wish.agent_id")
                    .take(take)
                    .skip(skip)
                    .getManyAndCount();
    }

    async allRecommendation(req: Request, res: Response, next: NextFunction) {
        const { page, pageSize: take }: any= req.query || {}
        const skip:number = (page-1) * take;
        return this.WishRepository.createQueryBuilder("wish")
                    .select(["wish", "result"])
                    .where('wish.recommendation_type = :type', {type: recommendation_type.agent_created})
                    .leftJoin('wish.result', 'result')
                    .leftJoinAndMapOne("wish.customer", User, "user", "user.id = wish.customer_id")
                    .leftJoinAndMapOne("wish.agent", User, "agent", "agent.id = wish.agent_id")
                    .limit(10)
                    .take(take)
                    .skip(skip)
                    .getManyAndCount()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.WishRepository.findOne(request.params.id);
    }

    async saveRecommendation(request: Request, response: Response, next: NextFunction) {
        const user = await this.UserRepository.findOne({email:'ishwar.rimal@gmail.com'})
        const agent = await this.UserRepository.findOne({email:String(request.query.agent_email)})
        const result = await this.ResultRepository.save({product_type: request.body.product_type})
        request.body.customer_id = user.id;
        request.body.agent_id = agent.id;
        request.body.recommendation_type = recommendation_type.agent_created;
        request.body.result = result;
        request.body.title = request.body.product_type
        return this.WishRepository.save(request.body);
    }

    async update(request: Request, response: Response, next: NextFunction) {
        let toUpdate:any = {status: wish_status[request.body.status]}
        const wishId: string = String(request.query.id);
        const wishEntry = await this.WishRepository.findOne(wishId)
        if(!wishEntry.agent_id){
            const agent = await getRepository(User).findOne({email: String(request.query.agent_email)})
            toUpdate.agent_id = agent.id;
        }
        const result = await getConnection()
                        .createQueryBuilder()
                        .update(Wish)
                        .set(toUpdate)
                        .where('id = :id', {id: wishId})
                        .execute()
        if(result && request.body.status === 'resolved'){
            const user = await getRepository(User).findOne({id: wishEntry.customer_id})
            MailHelper({useEmail: user.email, userName: user.username, productName: wishEntry.title, type: MailType.wishResolved})
        }
        return result;
    }

    async deleteRecommendation(request: Request, response: Response, next: NextFunction) {
        const wishId: string = String(request.query.id);
        let WishToRemove = await this.WishRepository.findOne(wishId);
        await this.WishRepository.remove(WishToRemove);
    }

}