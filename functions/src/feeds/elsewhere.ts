/**
 * Curator for Webster Hall events
 * https://www.websterhall.com/shows/
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
   obtainFeed: async () => {
     const events: EventsFeed = {
       calendarName: 'Elsewhere Brooklyn',
       lastBuildDate: new Date(),
       icon: '',
       link: '',
       defaultTimeZone,
       events: []
     }

     const res = await fetch.default("https://lwflvkpufoylpzeshaqc.supabase.co/rest/v1/rpc/get_events?select=data&offset=0&limit=36", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Zmx2a3B1Zm95bHB6ZXNoYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjE0MTM3MjYsImV4cCI6MTk3Njk4OTcyNn0.YumiVHyLkAo22HzkLBLWYFVvOPih9VBGDhE1pAATybo",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Zmx2a3B1Zm95bHB6ZXNoYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjE0MTM3MjYsImV4cCI6MTk3Njk4OTcyNn0.YumiVHyLkAo22HzkLBLWYFVvOPih9VBGDhE1pAATybo",
        "content-profile": "public",
        "content-type": "application/json",
        "prefer": "count=estimated,return=representation",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-client-info": "supabase-js/2.4.0",
        "Referer": "https://www.elsewherebrooklyn.com/",
        "Referrer-Policy": "strict-origin"
      },
      "body": "{}",
      "method": "POST"
    });
    const body = await res.json()
    for (let i = 0; i < body.length; i++) {
      const {data} = body[i]
      const url = data.url
      const categories = data.tags
      const location = `${data.venue} ${data.address}`
      const description = (() => {
        let des = data.description
        if (data.ticket_types[0]?.price?.total) {
          des += `\n\nTotal w/Fees: $${data.ticket_types[0].price.total/100}`
        }
        return des
      })()
      const dtstart = new Date(data.date)
      const dtend = new Date(data.date_end) 
      const summary = data.name

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
