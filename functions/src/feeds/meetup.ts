/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

const getEvents = (meetupId: string) => {
  return {
    obtainFeed: async () => {
      const events: EventsFeed = {
        calendarName: `meetup.com/${meetupId}`,
        lastBuildDate: new Date(),
        icon: '',
        link: '',
        defaultTimeZone,
        events: []
      }

      const res = await fetch.default(`https://www.meetup.com/${meetupId}/events/`)
      const body = await res.text()
      const $ = cheerio.load(body)

      const items = $('li.list-item')
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const url = $(item).find('a').attr('href')
        const summary = $(item).find('h2').text().trim()
        if (!summary) continue
        const location = $(item).find('address').text().trim()
        const body = $(item).find('.description-markdown--p').text().trim()
        const starttime = $(item).find('time').attr('datetime')
        const dtstart = new Date(parseInt(starttime))
        const dtend = new Date(dtstart)
        dtend.setHours(dtend.getHours() + 3)
        events.events.push({
          summary,
          dtend,
          dtstart,
          description: `${body} https://meetup.com${url}`,
          location,
          url: `https://meetup.com${url}`,
        })
      }

      return events
    }
  } as Curator
}

export default getEvents
