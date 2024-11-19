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
       calendarName: 'Pokémon League',
       lastBuildDate: new Date(),
       icon: '',
       link: '',
       defaultTimeZone,
       events: []
     }

     // Works for LPR
     const res = await fetch.default('https://op-core.pokemon.com/api/v2/event_locator/search/?distance=100&format=json&latitude=41.0895249&longitude=-73.8419063')
     const body = await res.json()

     const items = body.activities
     for (let i = 0; i < items.length; i++) {
       // Only support VGC
       const event = items[i]
       if (event.activity_format !== "vg_mod" && !event.products.includes('vg')) continue
       const prefix = {
        tcg_std: 'TCG',
        vg_mod: 'VGC',
       }
       const summary = `[${prefix[event.activity_format] ?? event.activity_format}] ${event.name}`
       const url = event.contact_information.website
       const categories = event.tags
       const location = `${event.address.name} ${event.address.address} ${event.address.city} ${event.address.state}`
       const description = (() => {
         let d = ''
         d += `${event.metadata.details ?? ''}\n${event.activity_type}\n${event.metadata.on_site_admission ?? ''}\nMore Info: ${event.contact_information.website ?? 'None'}\nRegister: ${event.metadata.third_party_registration_website ?? 'None'}\n${event.pokemon_url}`
         return d
       })() 
       // +4h
       const dtstart = getTime(event.start_datetime)
       const dtend = new Date(dtstart.getTime())
       dtend.setHours(dtend.getHours() + 4)

       events.events.push({
         summary,
         dtend,
         dtstart,
         description,
         location,
         url,
         categories,
       })
     }

     return events
   }
 } as Curator
