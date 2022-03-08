/**
 * Curator for https://kgbbar.com/events
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
const cheerio = require('cheerio')
const spacetime = require('spacetime')

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'KGB Bar',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://kgbbar.com/events')
    const body = await res.text()
    const $ = cheerio.load(body)

    const fcEvents = $('.fullcalendar-event-details')
    for (let i = 0; i < fcEvents.length; i++) {
      const event = $(fcEvents[i])
      const href = $(event).attr('href')
      const location = (() => {
        if (href.includes('/red-room/')) {
          return 'The Red Room'
        }
        return 'KGB Bar'
      })()
      const description = `https://kgbbar.com${href}`

      const summary = $(event).attr('title')
      const dtstart = getTime($(event).attr('start'))
      const dtend = getTime($(event).attr('end'))

      events.events.push({
        summary,
        dtend,
        dtstart,
        description,
        location,
        url: `https://kgbbar.com${href}`,
      })
    }

    return events
  }
} as Curator
