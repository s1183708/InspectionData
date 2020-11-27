import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { DataService } from './data.service';
import { FirebaseConfig } from './firebaseConfig.service'

@NgModule({
    imports: [ HttpClientModule ],
    providers: [ DataService, FirebaseConfig ]
})
export class CoreModule { }