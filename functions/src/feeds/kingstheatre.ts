/**
 * Curator for King's Theatre
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

async function getEventsForPage(page: number) {
  const url = `https://www.kingstheatre.com/calendar?page=${page}`
  const res = await fetch.default(url)
  const body = await res.text()
  return body
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Kings Theatre Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    for (let i = 1; i < 5; i++) {
      const body = await getEventsForPage(i)
      const $ = cheerio.load(body)
      const items = $('div.card.production.calendar.white')
      for (let j = 0; j < items.length; j++) {
        const item = $(items[j])
        const summary = $(item).find('.card-title').text().trim()
        const tickets = $(item).find('.card-actions a.btn-primary').attr('href')
        const more = $(item).find('.card-actions a.btn-outline-secondary').attr('href')
        const start = $(item).find('.calendar-time').text().trim().replace(/\s\s+/g, ' ')
        const dtstart = getTime(start)
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtend.getHours() + 3) // Assumption
        events.events.push({
          dtstart,
          dtend,
          location: "King's Theatre",
          summary,
          url: more,
          description: `More Info: ${more}\n\nBuy Tickest: ${tickets}`
        })
      }
    }

    return events
  }
} as Curator
