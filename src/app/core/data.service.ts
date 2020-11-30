import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {
    baseUrl: string = 'assets/';
    
    constructor(private http: HttpClient) { }

    getInspectionXML(url){
        return this.http.get(url, {responseType: "text"}).subscribe(value => {
            console.log(value)
        });
    }
}