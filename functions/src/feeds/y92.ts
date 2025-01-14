/**
 * Curator for Caveat
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
 
const defaultTimeZone = 'America/New_York'
 
export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Y92 Events Calendar',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for LPR
    const res = await fetch.default('https://www.92ny.org/webservices/categoryproduction.svc/categories/json/allprograms')
    const body = await res.text()
    const json = JSON.parse(body.trim())
    console.log(json[0])

    for (let i = 0; i < json.length; i++) {
      const ev = json[i]
      if (ev.CategoryProductionKeywords.find(t => t.keyword === 'Class')) {
        continue // Y92 has classes but I won't do them
      }
      const url = `https://www.92ny.org${ev.URL}`
      const firstDate = parseInt(ev.FirstDate.substring(6,19))
      const lastDate = parseInt(ev.LastDate.substring(6,19))
      console.log(firstDate, lastDate)
      console.log(new Date(firstDate))
      console.log(new Date(lastDate))
      events.events.push({
        summary: ev.Title,
        dtstart: new Date(firstDate),
        dtend: new Date(lastDate),
        description: `${ev.ShortDesc.trim()}\n\n${url}`,
        location: `Y92, 1395 Lexington Avenue, New York, NY`,
        url,
        categories: [...ev.CategoryProductionKeywords.map(t => t.keyword)],
      })
    }
 
    return events
  }
} as Curator
  