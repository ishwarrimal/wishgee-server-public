import {getRepository, getConnection, Not} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Result, Wish, User} from "../../entity";

export default class ResultController {
    private ResultRepository = getRepository(Result);
    private WishRepository = getRepository(Wish);

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take }: any= request.query || {}
        const skip:number = (page-1) * take;
        return this.ResultRepository.findAndCount({where: {product_brand : Not("brand")}, order: {id: "DESC"}, take, skip});
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.ResultRepository.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return this.ResultRepository.save(request.body);
    }

    async update(request: Request, response: Response, next: NextFunction) {
        const resultId: string = String(request.query.id);
        return getConnection()
                .createQueryBuilder()
                .update(Result)
                .set(request.body)
                .where('id = :id', {id: resultId})
                .execute();
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id: string = String(request.query.id);
        let ResultToRemove = await this.ResultRepository.findOne(id);
        const wish = await this.WishRepository.find({where: {result: ResultToRemove}})
        if(wish.length > 0){
            return 'Result used in wish'
        }
        await this.ResultRepository.remove(ResultToRemove);
    }

}