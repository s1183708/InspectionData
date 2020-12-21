import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FirebaseConfig } from './firebaseConfig.service';
import firebase from 'firebase/app'

@Injectable()
export class DataService {
    baseUrl: string = 'assets/';

    constructor(private http: HttpClient, private firebaseConfig: FirebaseConfig) { }
    
    async getInspectionXML(storagePath){
        storagePath = "gs://inspection-data-db247.appspot.com/companies/companyA/zxywvutsr/202012191812/test_inspection_202021210.xml"
        let storageurl = ""
        await firebase.storage().refFromURL(storagePath).getDownloadURL().then(url => {
            storageurl = url
            console.log(storagePath)
        })
        console.log(storageurl)
        await this.http.get(storageurl, {
            headers: new HttpHeaders()
                .set('Content-Type','text/xml')
                .append('Access-Control-Allow-Origin', '*')
                .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method")
                .append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS') 
            ,responseType: "text"}).subscribe(data => {
                console.log(data)
        })
    }
}