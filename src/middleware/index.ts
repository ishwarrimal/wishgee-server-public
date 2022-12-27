import admin from './firebaseAdmin';
import * as APIError from './apiError';

const veirfyAgent = (token: string) : Promise<boolean|string> => {
  return admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      const { email, is_agent } = decodedToken;
      if(email === process.env.DEFAULT_ADMIN) return email;
      if(email && is_agent) return email;
      return false;
    })
    .catch((e) => {
      console.log('Error verifying agent --------------------------- ', e);
      return false;
    })
}

const veirfyCustomer = (token: string) : string | boolean => {
  return admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      const { email, is_registered_user } = decodedToken;
      return email ? email : false;
    })
    .catch((e) => {
      console.log("error occured in verifyin customer ",e)
      return false;
    })
}

export { veirfyAgent, veirfyCustomer, admin, APIError };