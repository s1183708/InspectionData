import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {
    baseUrl: string = 'assets/';
    
    constructor(private http: HttpClient) { }

    getInspections(){
        return this.http.get(this.baseUrl+'inspectionapp-d5692-export.json');
    }
}