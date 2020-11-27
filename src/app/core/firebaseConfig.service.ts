//This service is used because it is necessary to have 2 instances
//of firebase running at the same time at points in execution

import { Injectable } from '@angular/core';

@Injectable()
export class FirebaseConfig {
    // config object copied from the firebase project itself
    firebaseConfig = {
        apiKey: "AIzaSyDDWf7iD0em9kPTHGPCyw8yeJubk5vcDpw",
        authDomain: "inspection-data-db247.firebaseapp.com",
        databaseURL: "https://inspection-data-db247.firebaseio.com",
        projectId: "inspection-data-db247",
        storageBucket: "inspection-data-db247.appspot.com",
        messagingSenderId: "884143065485",
        appId: "1:884143065485:web:184ac987f0bece1ff0d5c4",
        measurementId: "G-D6C8WJ6PYN"
    };  

    getFirebaseConfig(){
        return this.firebaseConfig
    }
}