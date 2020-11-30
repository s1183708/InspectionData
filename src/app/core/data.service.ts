import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class DataService {
    baseUrl: string = 'assets/';
    
    constructor(private http: HttpClient) { }

    getInspectionXML(url){
        // return this.http.get(url, {headers: {"Access-Control-Allow-Origin": "*"}, responseType: "text"}).subscribe(value => {
        //     console.log(value)
        // });
        fetch(url, {
            method: "get",
            mode: "cors",
            headers: {
                'Content-Type': 'text/xml',
                "Access-Control-Allow-Origin": "*"
            }
        }).then(resp => console.log(resp))
    }
}