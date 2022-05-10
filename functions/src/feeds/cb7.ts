/**
 * Curator for Manhattan CB7
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
      calendarName: 'Manhattan CB7',
      lastBuildDate: new Date(),
      icon: '',
      link: 'https://www1.nyc.gov/assets/manhattancb7/js/pages/calendar_events.js',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www1.nyc.gov/assets/manhattancb7/js/pages/calendar_events.js')
    const body = await res.text()

    const cals = body.split('\n')
    for (let i = 0; i < cals.length; i++) {
      const cal = cals[i]
      if (!cal.startsWith('calEvents')) continue
      if (cal.includes('OFFICECLOSED')) continue
      if (cal.toLowerCase().includes('board office closed')) continue
      if (cal.toLowerCase().includes('is closed')) continue
      if (cal.toLowerCase().includes('will not meet')) continue
      const dateR = cal.match("'(\\d+?\/\\d+?\/\\d+)")
      const nameR = cal.match('"previewArea">([\\w\\s,&:;\\-\'\\\\]+)<br')
      const timeR = cal.match('>(\\d+?:?\\d+?\\s?[AaPp][Mm])')
      if (timeR === null || timeR.length < 1) continue; // No time found. Ignore.
      const date = dateR![1]
      const name = nameR![1]
      const time = timeR![1]
      const dtstart = getTime(`${date} ${time}`)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 1.5)
      const summary = name
      events.events.push({
        summary,
        dtstart,
        dtend,
        description: 'Online via Zoom',
      })
    }

    return events
  }
} as Curator
 