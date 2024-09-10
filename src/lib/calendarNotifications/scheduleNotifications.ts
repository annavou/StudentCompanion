import type { Event } from '$lib/components/calendar/event/Event';
import { EventRepeatType } from '$lib/components/calendar/event/Event';
import { LocalNotifications } from '@capacitor/local-notifications';
import { cutId, calcNotifyDate, calcNotifId } from './notificationFunctions';
import { scheduleRepeatedNotifications,} from './repeatedNotifications';
import { getIds, addToScheduledNotifications, removeFromScheduledNotficiations } from "./notificationsStore";

// schedules a notification at a specific date
export async function schedule(event: Event, notifyDate: Date, id: number){
    console.log(notifyDate);
    try{        
        await LocalNotifications.schedule({notifications: [{
            title: event.title,
            body: event.description ? event.description : "Νέα ειδοποίηση",
            id: id,
            largeIcon: "res://drawable/logo.",
            smallIcon: "res://drawable/logo",
            schedule: {
                at: notifyDate,
                allowWhileIdle: true
            }
        }]});

    }catch(ex){
        console.log(JSON.stringify(ex));
        
    }
}

//cancels certain scheduled notifications
async function cancelNotifications(ids: number[]){ 

    try{    
        await LocalNotifications.cancel({
            notifications: ids.map(id => ({ id }))
        });
    }catch(ex){
        console.log(JSON.stringify(ex));
    }
}

// handles the calendar notifications
export async function scheduleNotification(event: Event, date: Date | undefined){
    // check if the the user resubmits the same event
    const ids = getIds();
    let notifIds = [0];
    let flag = false;
    for (const id of ids){
        console.log(event.id+"-"+id.event.id);
        if (event.id === id.event.id){
            notifIds = [...id.notificationIds];
            flag = true;
        }
    }

    if (flag){
        cancelNotifications(notifIds);
        removeFromScheduledNotficiations(event.id);
    }

    if (event.repeat != EventRepeatType.NEVER){     
        scheduleRepeatedNotifications(event);

    } else {
        const notificationId = await calcNotifId(cutId(event.id));
        const notifyDate = calcNotifyDate(event);
        const storedIds = {
            event: event,
            notificationIds: [ notificationId ],
            lastNotification: notifyDate,
        };
        addToScheduledNotifications(storedIds);
        
        schedule(event, notifyDate, notificationId);
    }
}