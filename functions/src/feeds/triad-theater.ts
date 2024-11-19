/**
 * Curator for Triad Theater
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

async function pullEventsFor(month: number, year: number) {
  if (month > 12) {
    month -= 12
    year++
  }
  const events = []
  const res = await fetch.default(`https://triadnyc.com/calendar/index.cfm?thismonth=${month}&thisyear=${year}`)
  const body = await res.text()
  const $ = cheerio.load(body)
  const days = $('td.hasEvent')
  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    const date = $(day).children('span').text()
    const items = $(day).find('a')
    for (let j = 0; j < items.length; j++) {
      const item = items[j]
      const href = $(item).attr('href')
      const [time, summary] = $(item).children('p.ec-eventTitle').text().split(' - ')
      const tlabel = `${month}/${date}/${year} ${time.replace(' ', '')}`
      const dtstart = getTime(tlabel)
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 2)
      const intro = $(item).find('.ec-dcRight').text().trim()
      events.push({
        summary,
        dtstart,
        dtend,
        location: 'Triad Theater',
        description: `${intro} ${href}`,
        url: href,
      })
    }
  }
  return events
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Triad Theater',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const now = new Date()
    for (let i = now.getMonth() + 1; i < now.getMonth() + 4; i++) {
      const moEvents = await pullEventsFor(i, now.getFullYear())
      events.events.push(...moEvents)
    }
    return events
  }
} as Curator
