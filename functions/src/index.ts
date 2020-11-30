import * as functions from 'firebase-functions';
import { database } from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
var admin = require('firebase-admin')
admin.initializeApp()

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const addUserStuff = functions.auth.user().onCreate((user)=>{
    const userDetails = {
        email: user.email,
        name: user.displayName
    }
    const ref = database().ref('users/'+user.uid)
    return ref.set(userDetails)
    .then(() => console.log(`Created user: ${user.email}`))
    .catch((error) => console.log(`Error: ${error}`));
});
