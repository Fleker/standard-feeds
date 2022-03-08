/**
 * Curator for https://lincolncenter.org
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
    const eventsFeed: EventsFeed = {
      calendarName: 'BRIC:',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.bricartsmedia.org/api/events')
    const body = await res.json()

    const eventsByDate = body.events
    for (let i = 0; i < eventsByDate.length; i++) {
      const {date, events} = eventsByDate[i]
      const dateString = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
      for (let j = 0; j < events.length; j++) {
        const event = events[j]
        const timeString = `${event.time.substring(0, 2)}:${event.time.substring(2, 4)}`
        const dtstart = getTime(`${dateString} ${timeString}`)
        const dtend = new Date(dtstart)
        dtend.setHours(dtend.getHours() + 2) // Assume
        const summary = (() => {
          if (event.eventSeries.length) return `${event.title} (${event.eventSeries})`
          return event.title
        })()
        // Try to root out any duplicate events.
        if (eventsFeed.events.find(e => e.summary === summary && e.dtstart === dtstart)) continue
        const url = event.link
        const description = `${event.desc} (${event.cost}) ${url}`.replace('\n', '')
        const location = event.location
        const categories = event.type
        eventsFeed.events.push({
          summary,
          dtend,
          dtstart,
          description,
          location,
          url,
          categories,
        })
      }
    }

    return eventsFeed
  }
} as Curator
