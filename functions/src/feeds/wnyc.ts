/**
 *
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

const getEvents = {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: `WNYC Events`,
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://www.wnyc.org/events/archive/`)
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div.event-tease')
    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      const title = $(item).find('.title').text().trim()
      const date = $(item).find('.date').text().trim().replace(/\n/g, '')
      const dtstart = getTime(date)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 3)
      const description = $(item).find('.no-object').text().trim()
      const url = $(item).find('a').attr('href').trim()
      events.events.push({
        summary: title,
        dtstart,
        dtend,
        description: `${description} ${url}`,
        url,
      })
    }

    return events
  }
} as Curator

export default getEvents
