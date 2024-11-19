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
      calendarName: 'Live Code NYC',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://livecode.nyc/events.html')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div.content').children('a')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const url = $(item).attr('href')
      const [elTitle, elDate] = $(item).children('div')
      const summary = $(elTitle).children('h2').text()
      // "Wonderville Show * Wonderville, ..."
      //                     ^^^^^^^^^^^^^^^^--
      const location = $(elTitle).text().substr(summary.length).trim()
      const dtstart = getTime($(elDate).text())
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 2)
      events.events.push({
        summary,
        dtend,
        dtstart,
        description: `https://livecode.nyc${url}`,
        location,
        url: `https://livecode.nyc${url}`,
      })
    }

    return events
  }
} as Curator
