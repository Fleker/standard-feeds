/**
 * Curator for https://lincolncenter.org
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
      calendarName: 'Summer on the Hudson',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.nycgovparks.org/events/summer_on_the_hudson?s=09')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('[itemtype="http://schema.org/Event"]')
    for (let i = 0; i < eventsByDate.length; i++) {
      const heading = $(eventsByDate[i]).children('.event_body').children('.event-title')
      const summary = $(heading).text().replace('Summer on the Hudson: ', '')
      const url = `https://nycgovparks.org${$(heading).children('a').attr('href')}`
      const location = $(eventsByDate[i]).children('.event_body').children('.location').text().replace('at ', '')
      const description = $(eventsByDate[i]).children('.event_body').children('p').text().replace(/\n/g, ' ')
      const dtstart = getTime($(eventsByDate[i]).children('.event_body').children('[itemprop="startDate"]').attr('content'))
      const dtend = getTime($(eventsByDate[i]).children('.event_body').children('[itemprop="endDate"]').attr('content'))
      events.events.push({
        summary,
        description: `${description} ${url}`,
        location,
        dtstart,
        dtend,
        url,
      })
    }

    return events
  }
} as Curator
