/**
 * Curator for https://www.musichallofwilliamsburg.com/calendar/
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
      calendarName: 'Music Hall of Williamsburg',
      lastBuildDate: new Date(),
      icon: '',
      link: 'https://www.musichallofwilliamsburg.com/calendar/',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.musichallofwilliamsburg.com/calendar/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('li.calendar-day')
    const location = 'Music Hall of Williamsburg'
    for (let i = 0; i < eventsByDate.length; i++) {
      const date = $(eventsByDate[i]).find('.calendar-day-title').text()
      const href = $(eventsByDate[i]).find('.event-headliner-link').attr('href')
      const url = `https://www.musichallofwilliamsburg.com/${href}`
      const title = $(eventsByDate[i]).find('.event-headliner').text()
      const secondary = $(eventsByDate[i]).find('.event-support').text()
      const dtstart = getTime(`${date} 8pm`)
      const dtend = getTime(`${date} 11pm`) // Roughly
      if (title.trim() === "") continue // Skip
      events.events.push({
        summary: title,
        description: `w/${secondary} ${url}`,
        location,
        url,
        dtstart,
        dtend,
      })
    }

    return events
  }
} as Curator
