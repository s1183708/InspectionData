import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const storageToDatabase = functions.storage.object().onFinalize(async (object) =>{
    let today = new Date
    if(object.contentType === "text/xml"){
        let pathComponents = object.name?.split("/")
        let timeSuffix = "AM"
        let hours = today.getHours()-5 //This gets the hours in UTC, since we are EST, this means it is UTC-5
        let currentDay = today.getDate()
        if(hours < 0){
            hours = 24 + hours
            currentDay -= 1
            if(currentDay === 0){ //Case for if its the last day of the month and UTC (which is 5 hours ahead) is on the next day already
                if(today.getMonth() === 1){
                    today.getFullYear() % 4 == 0 ? currentDay = 29 : currentDay = 28
                } else if (today.getMonth() === 3 || today.getMonth() === 5 || today.getMonth() === 8 || today.getMonth() === 10){
                    currentDay = 30
                } else {
                    currentDay = 31
                }
            }
        }
        if(hours > 12){
            hours -= 12
            timeSuffix = "PM"
        }
        if(hours === 0){
            hours = 12
        }

        let minutes = today.getMinutes().toString()
        if(minutes.length === 1){
            minutes = "0"+minutes
        }

        let seconds = today.getSeconds().toString()
        if(seconds.length === 1){
            seconds = "0"+seconds
        }
        await admin.database().ref("/inspections/"+pathComponents![1]+"/"+pathComponents![2]+"/"+pathComponents![3]).update({
            inspection_data: "gs://inspection-data-db247.appspot.com/companies/"+pathComponents![1]+"/"+pathComponents![2]+"/"+pathComponents![3],
            inspection_datetime: (today.getMonth()+1)+"/"+currentDay+"/"+today.getFullYear()+" "+hours+":"+minutes+":"+seconds+" "+timeSuffix
        })
    }
})