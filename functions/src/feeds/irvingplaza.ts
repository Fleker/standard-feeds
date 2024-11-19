/**
 * Curator for Irving Plaza (via Live Nation)
 */

// const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, 'Europe/London')
  return new Date(spacetimeDate.toLocalDate())
}

async function fetchEvents(page: number) {
  const url = `https://www.livenation.com/_next/data/PAh682KIcCv6rz8ymDFCV/venue/KovZpaFPje/irving-plaza-events.json?discovery_id=KovZpaFPje&slug=irving-plaza&pg=${page}`
  const res = await fetch.default(url)
  const body = await res.json()
  return body.pageProps.queryResults.page.data.getEvents
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Irving Plaza Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    for (let i = 1; i < 5; i++) {
      const fetchedEvents = await fetchEvents(i)
      for (let j = 0; j < fetchedEvents.length; j++) {
        const ev = fetchedEvents[j]
        const dtstart = getTime(ev.event_date_timestamp_utc)
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtstart.getHours() + 3) // Assumption
        events.events.push({
          summary: ev.name,
          url: ev.url,
          description: ev.url,
          location: '17 Irving Plaza',
          dtstart,
          dtend,
        })
      }
    }

    return events
  }
} as Curator
