import {getRepository, getConnection} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {Result} from "../../entity";
import { type } from "os";
import { wish_status } from "../../entity/wishEntity";
import { NOTFOUND } from "dns";

export default class ResultController {
    private ResultRepository = getRepository(Result);

    async getInstantResult(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take, user_email, title: product_type, max_budget, min_budget, keywords: requestKeywords, brands_included }: any = request.query || {};
        const new_max = Number(max_budget)+(max_budget/100*15);
        const new_min = Number(max_budget)-(max_budget/100*30);
        let result;
        let requestBrands = brands_included.length > 0 ? brands_included.split(',') : [];
        console.log(requestBrands)
        if(requestBrands.length > 0){
            result = await this.ResultRepository
                            .createQueryBuilder("result")
                            .select(['result'])
                            .where('product_price <= :max_budget', {max_budget})
                            .andWhere('product_brand IN (:...requestBrands)',{requestBrands})
                            .andWhere('product_price >= :min_budget', {min_budget})
                            .andWhere('product_type = :product_type', {product_type})
                            .orderBy('result.product_price', 'DESC')
                            .limit(20)
                            .getMany();
        }else{
            result = await this.ResultRepository
                            .createQueryBuilder("result")
                            .select(['result'])
                            .where('product_price <= :max_budget', {max_budget})
                            .andWhere('product_price >= :min_budget', {min_budget})
                            .andWhere('product_type = :product_type', {product_type})
                            .orderBy('result.product_price', 'DESC')
                            .limit(20)
                            .getMany();

        }
        // let bestMatchingResultIndex = 0 ;
        // let bestMatchKeywrodsLength = 0;
        const userKeywords = requestKeywords && requestKeywords.split(',').map(x => x.toLowerCase().trim());
        // if(result.length > 2){
        {
            result.length && result.forEach((res,index) => {
                let count = 0;
                const { keywords } = res;
                const keywordsList = keywords.split(',').map(x => x.toLowerCase().trim());
                const matchedKeywords = keywordsList.filter(x => userKeywords.includes(x.toLowerCase())) || [];
                count = matchedKeywords.length;
                res.countMatch = count;
                res.matchedKeywords = matchedKeywords;
                // matchedKeywords.set(index, count);
                // if(count > bestMatchKeywrodsLength){
                //     matchedKeywords = resIntersection
                //     bestMatchKeywrodsLength = count;
                //     bestMatchingResultIndex = index;
                // }
            })
        }
        result.sort((r1, r2) => r2.countMatch - r1.countMatch);
        // let resToReturn = []
        // if(userKeywords.length === 0 || (matchedKeywords.length/userKeywords.length >= 0.5) ){
        // let resToReturn = result.splice(0,5) || []
        // }else{
        //     resToReturn = false;
        // }
        const toReturn = { title: product_type, 
            max_budget, 
            status: wish_status.resolved,
            created: new Date(),
            result :  result.splice(0,5)
        }
        return [toReturn,1];
    }


    async getProductList(req: Request, res: Response, next: NextFunction) {
        const { page, pageSize: take, product }: any= req.query || {}
        const skip:number = (page-1) * take;
        return this.ResultRepository
                                .createQueryBuilder("result")
                                .select(['result'])
                                .where('product_type = :product', {product})
                                .andWhere("product_brand != 'brand'")
                                .orderBy('result.updated', 'ASC')
                                .take(take)
                                .skip(skip)
                                .getManyAndCount();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.ResultRepository.findOne(request.params.id);
    }

    async updateMany(request: Request, response: Response, next: NextFunction) {
        const updateList = request.body;
        Object.keys(updateList).forEach(resultId => {
            getConnection()
                .createQueryBuilder()
                .update(Result)
                .set(updateList[resultId])
                .where('id = :id', {id: Number(resultId)})
                .execute();
        })
        return true;
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let ResultToRemove = await this.ResultRepository.findOne(request.params.id);
        await this.ResultRepository.remove(ResultToRemove);
    }

}