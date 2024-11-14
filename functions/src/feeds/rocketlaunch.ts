/**
 * Curator for Caveat
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
 
const defaultTimeZone = 'America/New_York'
 
export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'RocketLaunch Upcoming Launches',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for LPR
    const res = await fetch.default('https://fdo.rocketlaunch.live/json/launches/next/5')
    const body = await res.json()
    const items = body.result

    for (let i = 0; i < items.length; i++) {
      const ev = items[i]
      const url = `https://fdo.rocketlaunch.live/launch/${ev.slug}`
      events.events.push({
        summary: ev.name,
        dtstart: new Date(ev.win_open),
        dtend: new Date(ev.t0),
        description: `${ev.launch_description.trim()}\n\n${url}`,
        location: `${ev.pad.location.name}, ${ev.pad.location.statename ?? ev.pad.location.country} (${ev.pad.name})`,
        url,
        categories: [...ev.tags.map(t => t.text)],
      })
    }
 
    return events
  }
} as Curator
  