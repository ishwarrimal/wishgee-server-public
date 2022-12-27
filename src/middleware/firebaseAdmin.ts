const admin = require('firebase-admin');
import serviceAccount from '../../serviceAccountKey'

admin.initializeApp({
    credential: admin.credential.cert(process.env.NODE_ENV === 'production' ? serviceAccount.prodServiceAccountKey : process.env.NODE_ENV === 'staging' ? serviceAccount.stagingServiceAccountKey : serviceAccount.localServiceAccountKey)
})

export default admin;