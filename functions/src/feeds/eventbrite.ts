/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

const getEvents = (eventbriteId: string) => {
  return {
    obtainFeed: async () => {
      const events: EventsFeed = {
        calendarName: `eventbrite.com/o/${eventbriteId}`,
        lastBuildDate: new Date(),
        icon: '',
        link: '',
        defaultTimeZone,
        events: []
      }

      const res = await fetch.default(`https://www.eventbrite.com/o/${eventbriteId}`)
      const body = await res.text()
      const $ = cheerio.load(body)

      // const items = $('div.eds-event-card--consumer')
      const jsonLd = $('script[type="application/ld+json"]')[1]
      const items = JSON.parse($(jsonLd).html().trim())
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const summary = item.name
        const url = item.url
        const price = item.offers.lowPrice
        const location = item.location.name
        const dtstart = new Date(item.startDate)
        const dtend = new Date(item.endDate)
        const description = item.description
        events.events.push({
          summary,
          dtend,
          dtstart,
          description: `${description} ${price} ${url}`,
          location,
          url,
        })
      }

      return events
    }
  } as Curator
}

export default getEvents
