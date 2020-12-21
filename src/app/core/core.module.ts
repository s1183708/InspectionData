import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { FirebaseConfig } from './firebaseConfig.service'

@NgModule({
    imports: [ HttpClientModule ],
    providers: [ FirebaseConfig ]
})
export class CoreModule { }