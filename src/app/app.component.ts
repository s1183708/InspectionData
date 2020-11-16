import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import firebase from 'firebase/app'

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  title = 'InspectionDataWebPortal';

  ngOnInit(){
    // config object copied from the firebase project itself
    var firebaseConfig = {
      apiKey: "AIzaSyDDWf7iD0em9kPTHGPCyw8yeJubk5vcDpw",
      authDomain: "inspection-data-db247.firebaseapp.com",
      databaseURL: "https://inspection-data-db247.firebaseio.com",
      projectId: "inspection-data-db247",
      storageBucket: "inspection-data-db247.appspot.com",
      messagingSenderId: "884143065485",
      appId: "1:884143065485:web:184ac987f0bece1ff0d5c4",
      measurementId: "G-D6C8WJ6PYN"
    };  
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  }
}
