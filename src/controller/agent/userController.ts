import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../../entity";
import { admin, APIError } from "../../middleware";
import { Role } from '../../entity/userEntity';

export default class UserController {

    private UserRepository = getRepository(User)

    async all(request: Request, response: Response, next: NextFunction) {
        const { page, pageSize: take }: any= request.query || {}
        const skip:number = (page-1) * take;
        return this.UserRepository.findAndCount({where:{role: Role.agent}, take, skip});
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.UserRepository.findOne(request.params.id);
    }

    async update(request: Request, response: Response, next: NextFunction){
        const { email } = request.body
        const { id, agent_email } = request.query;
        if(email !== agent_email ){
            return "Not allowed to edit other user";
        }
        return this.UserRepository
                    .createQueryBuilder()
                    .update(User)
                    .set(request.body)
                    .where("id = :id", {id})
                    .execute();
    }

    async save(request: any, response: any, next: NextFunction) {
        if(request.query.agent_email !== process.env.DEFAULT_ADMIN){
            return 'only admin can create a user';
        }
        return admin
            .auth()
            .createUser({
                ...request.body,
                displayName: request.body.username,
                emailVerified: true,
            })
            .then((decodedToken) => {
                const { uid, displayName: username, photoUrl: profile_picture, email, emailVerified: email_verified } = decodedToken;
                const body = { role: 1, username, profile_picture, email, email_verified, sign_in_provider: 'agent created'};
                return this.UserRepository.save(body).then(res => {
                    admin.auth().setCustomUserClaims(uid, { is_registered_user : true, is_agent: true})
                    return "User successfully added "+res.username;
                })
            })
            .catch((error) => {
                console.log('error ', error)
                throw APIError(400)
                // Handle error
            });
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.UserRepository.findOne(request.params.id);
        await this.UserRepository.remove(userToRemove);
    }

}