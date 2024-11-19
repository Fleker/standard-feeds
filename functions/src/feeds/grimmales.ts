/**
 *
 */
const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(date: string, time: string) {
  const d = new Date(date)
  let spacetimeDate = spacetime(d.getTime(), defaultTimeZone)
  spacetimeDate = spacetimeDate.time(time.toUpperCase())
  return new Date(spacetimeDate.toLocalDate())
}

const getEvents = {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: `Grimm Ales`,
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://grimmales.com/events/`)
    const body = await res.text()
    const $ = cheerio.load(body)

    // const items = $('div.eds-event-card--consumer')
    const items = $('section div.excerpt-box-wrap')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const date = $(item).find('span.excerpt-box-date').text().replace(/[.]/g, '-')
      const timeName = $(item).find('h4').text()
      const [tstart, tend, summary] = (() => {
        if (timeName.includes('|')) {
          const [time, summary] = timeName.split('|')
          if (time.includes('-')) {
            const timesplit = time.split('-')
            return [timesplit[0] + 'pm', timesplit[1], summary]
          }
        } else if (timeName.includes(':')) {
          const [time, summary] = timeName.split(':')
          return [time, time, summary]
        }
        return [undefined, undefined, undefined]
      })()
      if (!summary) continue;
      const url = $(item).find('a').attr('href')
      const location = 'Grimm Artisnal Arts'
      const dtstart = getTime(date, tstart)
      let dtend = getTime(date, tend)
      if (dtend.getTime() === dtstart.getTime()) {
        dtend.setHours(dtend.getHours() + 2)
      }
      events.events.push({
        summary: summary.trim(),
        dtend,
        dtstart,
        description: `${url}`,
        location,
        url,
      })
    }

    return events
  }
} as Curator

export default getEvents
