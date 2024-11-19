/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

const cheerio = require('cheerio')
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
      calendarName: 'Friendzy',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for any Bowery Presents
    const res = await fetch.default('http://www.friendzyevents.com/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const content = $('tbody > tr > td > table > tbody > tr > td > div > div > p').html()
    const items = content.split('-<br>')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const [title, place, date, info] = item.split('<br>')
      const dtstart = getTime(date)
      dtstart.setHours(19) // ~7pm?
      dtstart.setMinutes(0)
      events.events.push({
        summary: title.replace('<strong>', '').replace('</strong>', '').trim(),
        location: place.trim(),
        description: info,
        dtstart,
        dtend: dtstart
      })
    }

    return events
  }
} as Curator
