import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {ProductType} from "../../entity";

export default class ProductTypeController {

    private ProductTypeRepository = getRepository(ProductType);

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take }: any= request.query || {}
        const skip:number = (page-1) * take;
        return this.ProductTypeRepository.findAndCount();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.ProductTypeRepository.findOne(request.params.id);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.ProductTypeRepository.findOne(request.params.id);
        await this.ProductTypeRepository.remove(userToRemove);
    }

}