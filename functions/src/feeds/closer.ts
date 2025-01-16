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

    const res = await fetch.default(`https://becloser.co/pages/members`)
    const body = await res.text()
    // console.log(body)
    const $ = cheerio.load(body)

    const items = $('.product-item')
    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      const url = $(item).find('.product-link').attr('href')
      const title = $(item).find('.product-item__title').text()
      const tsplit = title.split('|')
      const summary = tsplit[0].trim()
      // 1.17.25 => 1-17-2025
      const date = tsplit[1].replace('.', '-').replace('.', '-20')
      const description = $(item).find('.product-item__price')
        .text()
        .trim()
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
      const dtstart = getTime(date)
      const dtend = new Date(dtstart.getTime() + 1000 * 60 * 60 * 3)
      events.events.push({
        summary,
        dtstart,
        dtend,
        description: `${description} https://becloser.co${url}`,
        url: `https://becloser.co${url}`
      })
    }

    return events
  }
} as Curator

export default getEvents
