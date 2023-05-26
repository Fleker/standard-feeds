/**
 * Curator for Downtown Brooklyn events
 * https://www.downtownbrooklyn.com/events?categories=downtown-brooklyn-presents
 */

const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(date: string, time: string) {
  let spacetimeDate = spacetime(date, defaultTimeZone)
  if (!time.endsWith('m') && !time.endsWith('M')) {
    time = time + 'PM'
  }
  // console.log(date, time)
  spacetimeDate = spacetimeDate.time(time.toUpperCase())
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Timeout Market Brooklyn',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for any Bowery Presents
    const res = await fetch.default('https://www.timeoutmarket.com/newyork/shows-events/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('article')
    for (let i = 0; i < items.length; i++) {
      const $event = $(items[i])

      const summary = $event.find('.academy-studio__title').text().trim()
      // const category = $event.find('.academy-studio__category').text().trim()
      const date = $event.find('.icon-date-2').text().trim()
      const time = $event.find('.icon-tempo').text().trim().split('-')
      const description = $event.find('.academy-studio__description').text().trim()
      const url = $event.find('.academy-studio__link').attr('href');
      // console.log(date, time)
      const dtstart = (() => {
        if (time[0] === 'ALL DAY') {
          return getTime(`${date}/${new Date().getFullYear()}`, `8am`)
        }
        return getTime(`${date}/${new Date().getFullYear()}`, `${time[0]}`)
      })()
      const dtend = (() => {
        if (time[0] === 'ALL DAY') {
          return getTime(`${date}/${new Date().getFullYear()}`, `10pm`)
        } else if (time.length >= 2) {
          return getTime(`${date}/${new Date().getFullYear()}`, `${time[1]}`)
        }
        const d = new Date(dtstart)
        d.setHours(d.getHours() + 2)
        return d
      })()
      // console.log(dtstart.toISOString())

      events.events.push({
        summary,
        dtend,
        dtstart,
        description: description + '\n' + url,
        location: 'Timeout Market Brooklyn',
        url,
      })
    }

    return events
  }
} as Curator
