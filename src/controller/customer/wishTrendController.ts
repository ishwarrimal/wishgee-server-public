import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {WishTrend} from "../../entity";

export default class WishTrendController {

    private WishTrendRepository = getRepository(WishTrend);

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take }: any= request.query || {}
        const skip:number = (page-1) * take;
        return this.WishTrendRepository.findAndCount({take,skip});
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.WishTrendRepository.findOne(request.params.id);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.WishTrendRepository.findOne(request.params.id);
        await this.WishTrendRepository.remove(userToRemove);
    }

}