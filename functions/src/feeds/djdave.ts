/**
 * Curator for DJ Dave
 * https://djdave.xyz/
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
      calendarName: 'Downtown Brooklyn',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for any Bowery Presents
    const res = await fetch.default('https://djdave.xyz/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div[grid-col="5"]')
    for (let i = 0; i < items.length; i++) {
      const event = $(items[i])
      const summary = $(event).find('h3').text().trim()
      const location = $(event).find('span.address-title').text()
      const locationContext = $(event).find('address').text().trim()
      const dateTime = $(event).find('h5').text()
        .trim()
        .replace('|', '')
        .replace(/\s\s*/g, ' ')
        .replace(/\n/g, ' ')
      const dtstart = getTime(dateTime)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 2)
      const url = $(event).find('a').attr('href')

      events.events.push({
        summary,
        dtend,
        dtstart,
        description: `${locationContext} ${url}`,
        location,
        url,
      })
    }

    return events
  }
} as Curator
