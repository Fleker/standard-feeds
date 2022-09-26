/**
 * Curator for Webster Hall events
 * https://www.websterhall.com/shows/
 */

 const spacetime = require('spacetime')
 import * as fetch from 'node-fetch'
 import { Curator, EventsFeed } from './ical'
 
 const defaultTimeZone = 'America/New_York'
 
  function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
   return new Date(spacetimeDate.toLocalDate())
 }
 
 export default {
   obtainFeed: async () => {
     const events: EventsFeed = {
       calendarName: 'Webster Hall',
       lastBuildDate: new Date(),
       icon: '',
       link: '',
       defaultTimeZone,
       events: []
     }
 
     // Works for LPR
     const res = await fetch.default('https://aegwebprod.blob.core.windows.net/json/events/85/events.json')
     const body = await res.json()

     const items = body.events
     const location = 'Webster Hall'
     for (let i = 0; i < items.length; i++) {
       const event = items[i]
       const dtstart = getTime(event.eventDateTimeUTC)
       const dtend = new Date(dtstart.getTime())
       // +2:30h
       dtend.setHours(dtend.getHours() + 2)
       dtend.setMinutes(dtend.getMinutes() + 30)
       const summary = event.title.headlinersText
       const url = event.eventRedirect.url
 
       events.events.push({
         summary,
         dtend,
         dtstart,
         description: `${event.doorPrice} ${url}`,
         location,
         url,
       })
     }
 
     return events
   }
 } as Curator
  