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
      calendarName: 'Intrepid Museum',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.intrepidmuseum.org/PublicEventsCalendar.aspx')
    const body = await res.text()
    const $ = cheerio.load(body)
    const divs = $('div.filterDiv.free')
    for (let i = 0; i < divs.length; i++) {
      const summary = $(divs[i]).find('.event_title').html()
        .replace(/.*<br>/, '')
        .replace(/<br>.*/, '')
        .replace(/<span.*/, '')
        .trim()
      const start = $(divs[i]).find('span.tableDataMonthsSubHeading2').text().trim()
        .replace(/–.*/, '')
      const dtstart = getTime(start)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 2) // Guess
      const description = $(divs[i]).find('span.monthsDescriptionTextLeft').text()
        .replace('Pre-register here', '')
        .replace('Register here', '')
        .trim()
      const url = $(divs[i]).find('strong a').attr('href')
      events.events.push({
        summary, description, url, location: 'Intrepid Museum',
        dtstart, dtend,
      })
    }
    return events
  }
} as Curator
