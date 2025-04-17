/**
 * Curator for Freehold Brookyln
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Irish Arts Center',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://irishartscenter.org/api/element/events.json?page=1&categories=18,19,548,549,551,455,554,562,563,5817,10562,17054&date=2025-04-16&type=event`)
    const body = await res.json()
    const items = body.data
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const url = item.url
      const summary = item.title
      const dtstart = new Date(item.startDate.date)
      const dtend = new Date(item.endDate.date)
      events.events.push({
        summary,
        dtstart,
        dtend,
        location: 'Irish Arts Center',
        description: `${item.description} -- ${url}`,
        url,
      })
    }
    return events
  }
} as Curator
