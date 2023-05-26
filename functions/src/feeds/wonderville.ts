/**
 * Curator for Wonderville
 */

// const spacetime = require('spacetime')
const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

// function getTime(str: string) {
//   // console.log(str)
//   const spacetimeDate = spacetime(str, defaultTimeZone)
//   return new Date(spacetimeDate.toLocalDate())
// }

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Wonderville',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://www.wonderville.nyc/events`)
    const body = await res.text()
    const $ = cheerio.load(body)
    const items = $('article.eventlist-event')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const header = $(item).find('a.eventlist-title-link')
      const summary = $(header).text().trim()
      const url = `https://www.wonderville.nyc/${$(header).attr('href')}`
      const location = 'Wonderville'
      const [start, end] = $(item).find('span.eventlist-meta-time')
      let startdate = $(start).find('.event-time-24hr').attr('datetime')
      let starttime = $(start).find('.event-time-24hr').text().trim()
      let enddate = $(end).find('.event-time-24hr').attr('datetime')
      let endtime = $(end).find('.event-time-24hr').text().trim()
      if (startdate === undefined) {
        // Single-day event
        const [start, end] = $(item).find('.eventlist-meta .event-time-24hr time')
        startdate = $(start).attr('datetime')
        starttime = $(start).text().trim()
        enddate = $(end).attr('datetime')
        endtime = $(end).text().trim()
      }
      const dtstart = new Date(`${startdate} ${starttime}`)
      const dtend = new Date(`${enddate} ${endtime}`)
      const description = $(item).find('.eventlist-description .html-block').text().trim()
      events.events.push({
        summary,
        dtstart,
        dtend,
        location,
        description: `${description} ${url}`,
        url,
      })
    }
    return events
  }
} as Curator
