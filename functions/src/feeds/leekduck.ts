/**
 * Curator for Caveat
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
 
const defaultTimeZone = 'America/New_York'
 
export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Leekduck Pokémon GO Events Calendar',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for LPR
    const res = await fetch.default('https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.min.json')
    const items = await res.json()

    const location = ''
    for (let i = 0; i < items.length; i++) {
      const ev = items[i]
      const description = `${ev.heading}\n${ev.link}\n${ev.extraData?.generic?.hasSpawns ? 'Has Spawns\n' : ''}${ev.extraData?.generic?.hasFieldResearchTasks ? 'Has Field Research Tasks\n' : ''}`
      const dtstart = new Date(ev.start)
      dtstart.setHours(dtstart.getHours() + 5)
      const dtend = new Date(ev.end)
      dtend.setHours(dtend.getHours() + 5)
      events.events.push({
        summary: ev.name,
        dtstart,
        dtend ,
        description,
        location,
        url: ev.link,
        categories: [ev.eventType],
      })
    }
 
    return events
  }
} as Curator
  