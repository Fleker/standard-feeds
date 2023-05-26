/**
 * Curator for Freehold Brookyln
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Freehold Brooklyn',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://freeholdprogramming.com/poshAPI/61ba489a42c0810033fe9e1f`)
    const body = await res.json()
    const items = body.events
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const url = `https://posh.vip/e/${item.url}`
      const summary = item.name
      const dtstart = new Date(item.startDate)
      const dtend = new Date(item.endDate)
      events.events.push({
        summary,
        dtstart,
        dtend,
        location: '45 S 3rd St, Brooklyn, NY 11249, USA',
        description: `${url}`,
        url,
      })
    }
    return events
  }
} as Curator
