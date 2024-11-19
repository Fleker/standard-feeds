/**
 * Curator for Sundae Sauuce
 */

// const spacetime = require('spacetime')
const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
const spacetime = require('spacetime')

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  // console.log(str)
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Sundae Sauuce',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://www.sundaesauuce.com/events`)
    const body = await res.text()
    const $ = cheerio.load(body)
    const items = $('div.w-dyn-items div[role="listitem"]')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const url = $(item).find('a.event-link').attr('href')
      const summary = $(item).find('div.w-col-5').text().trim()
      const location = $(item).find('div.column-4').text().trim()
      const date = $($(item).find('div.w-col-2')[0]).text().trim()
      if (!date) continue
      const dtstart = getTime(`${date} 7pm`)
      const dtend = getTime(`${date} 10pm`)
      events.events.push({
        summary,
        dtstart,
        dtend,
        location,
        description: `${url}`,
        url,
      })
    }
    return events
  }
} as Curator
