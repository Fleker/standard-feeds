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
      calendarName: `Drink NY`,
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://thinknydrinkny.com/festivals/`)
    const body = await res.text()
    // console.log(body)
    const $ = cheerio.load(body)

    const items = $('.fl-node-content.fl-col-content:has(img)').slice(1)
    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      const textEl = $(item).find('p').html()
        .replace('<strong>', '')
        .replace('</strong>', '')
        .replace(/\n/g, '')
        .split('<br>')
      console.log(textEl)
      const summary = textEl[0]
      const dtstart = getTime(`${textEl[1]} 1PM`)
      const dtend = new Date(dtstart.getTime() + 1000 * 60 * 60 * 4)
      const location = textEl[2].replace('at the ', '')
      const url = $(item).find('a').attr('href')
      const description = url
      events.events.push({
        summary,
        dtstart,
        dtend,
        description,
        url,
        location,
      })
    }

    return events
  }
} as Curator

export default getEvents
