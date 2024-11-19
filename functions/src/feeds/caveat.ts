/**
 * Curator for Caveat
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
       calendarName: 'Caveat',
       lastBuildDate: new Date(),
       icon: '',
       link: '',
       defaultTimeZone,
       events: []
     }
 
     // Works for LPR
     const res = await fetch.default('https://caveat.nyc/api/events/upcoming')
     const body = await res.json()

     const items = body.records
     const location = 'Caveat NYC'
     for (let i = 0; i < items.length; i++) {
       const event = items[i].fields
       const dtstart = getTime(event['Event start date and time'])
       const dtend = getTime(event['End date and time'])
       const summary = event['Event']
       const description = (() => {
         let out = ''
         if (event['Sold out']) {
          out += 'This event is sold out.\n\n'
         }
         if (event['Doors TIME ONLY']) {
          out += `Doors open ${event['Doors TIME ONLY']}\n\n`
         }
         if (event['Tickets advance']) {
          out += `$${event['Tickets advance']} in advance.\n`
         }
         if (event['Tickets door']) {
          out += `$${event['Tickets door']} at the door.\n`
         }
         if (event['Tickets Livestream']) {
          out += `A livestream is available for $${event['Tickets Livestream']}.\n`
         }
         out += event['Ticket URL']
         return out
       })()
       const url = event['Ticket URL']
 
       events.events.push({
         summary,
         dtend,
         dtstart,
         description,
         location,
         url,
         categories: [event['Web tags']]
       })
     }
 
     return events
   }
 } as Curator
  