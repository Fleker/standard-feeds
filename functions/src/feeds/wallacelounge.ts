/**
 * Curator for Wallace Lounge
 */

// const spacetime = require('spacetime')
const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
const spacetime = require('spacetime')

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Wallace Lounge',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://thewallace.com/lounge`)
    const body = await res.text()
    const $ = cheerio.load(body)
    const items = $('div.events-slider--richtext p')
    const url = 'https://thewallace.com/lounge'
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const predate = $(item).find('strong').html().split("<br>")[0]
      const summary = $(item).find('em').text().trim()
      const date = (cheerio.load(predate).text()).split(' ').slice(1).join(' ').trim() // Remove dow
      const texts = $(item).text().split('|')
      const description = texts[1]
      const dtstart = getTime(`${date} 7pm`)
      const dtend = getTime(`${date} 10pm`)
      events.events.push({
        summary,
        dtstart,
        dtend,
        location: 'The Wallace Lounge',
        description: `${summary} | ${description} ${url}`,
        url,
      })
    }
    return events
  }
} as Curator
