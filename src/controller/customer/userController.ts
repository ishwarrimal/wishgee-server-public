import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../../entity";
import { admin, APIError } from "../../middleware";

export default class UserController {

    private UserRepository = getRepository(User);

    async testServer(request: any, response: any, next: NextFunction){
        return [true, 1]
    }

    async save(request: any, response: any, next: NextFunction) {
        const token = request.body.token.toString();
        const user = request.body.username
        return admin
            .auth()
            .verifyIdToken(token)
            .then((decodedToken) => {
                const { uid, is_registered, email_verified, email } = decodedToken;
                if(is_registered === false && email_verified){
                    //update the user as is_registerd_user true and email verified true;
                    return this.UserRepository
                    .createQueryBuilder()
                    .update(User)
                    .set({email_verified: true})
                    .where("email = :email", {email})
                    .execute().then(res => {
                        admin.auth().setCustomUserClaims(uid, { is_registered : true})
                        return "User successfully updated ";
                    })
                }
                const { name: username = user, picture: profile_picture, firebase: { sign_in_provider} } = decodedToken;
                const body = { role: 0, username, profile_picture, email, email_verified, sign_in_provider};
                return this.UserRepository.save(body).then(res => {
                    admin.auth().setCustomUserClaims(uid, { is_registered : email_verified ? true : false})
                    return "User successfully added "+res.username;
                })
            })
            .catch((error) => {
                console.log('error ', error)
                // Handle error
            });
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.UserRepository.findOne(request.params.id);
        await this.UserRepository.remove(userToRemove);
    }

}