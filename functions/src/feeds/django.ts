/**
 * Curator for Downtown Brooklyn events
 * https://www.downtownbrooklyn.com/events?categories=downtown-brooklyn-presents
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
      calendarName: 'The Django',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for any Bowery Presents
    const res = await fetch.default('https://www.thedjangonyc.com/events/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div.grid__listings article')
    for (let i = 0; i < items.length; i++) {
      const event = $(items[i])
      const summary = $(event).find('h3').text().trim()
      const dateTime = $(event).find('p.event__info').html()
      const dtArr = dateTime.split('<br>')
      const tArr = dtArr[1].split('-')
      const dtstart = getTime(`${dtArr[0].trim()} ${tArr[0].trim()}`)
      const dtend = getTime(`${dtArr[0].trim()} ${tArr[1].trim()}`)
      const url =  `https://www.thedjangonyc.com/${$(event).find('a').attr('href')}`

      events.events.push({
        summary,
        dtend,
        dtstart,
        description: url,
        location: 'The Django',
        url,
      })
    }

    return events
  }
} as Curator
