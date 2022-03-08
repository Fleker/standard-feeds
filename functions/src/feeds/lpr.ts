/**
 * Curator for Le Poisson Rouge events
 * https://lpr.com/
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
      calendarName: '(Le) Poisson Rouge',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for LPR
    const res = await fetch.default('https://lpr.com/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div.event')
    const location = 'Le Poisson Rouge'
    for (let i = 0; i < items.length; i++) {
      const event = $(items[i])
      const date = $(event).find('.date-time').text().trim()
        .replace(/\n/g, ' ')
        .replace(/\t/g, '')
      const dtstart = getTime(date)
      const dtend = new Date(dtstart.getTime())
      // +2:30h
      dtend.setHours(dtend.getHours() + 2)
      dtend.setMinutes(dtend.getMinutes() + 30)
      const summary = $(event).find('.black_visible').text().trim()
      const locationContext = $(event).find('.spaceTitle').text().trim()
      const url = $(event).find('.eventSingleLink').attr('href')

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
 