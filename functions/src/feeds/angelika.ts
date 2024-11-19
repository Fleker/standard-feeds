/**
 * Curator for Angelika Theater
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: '',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://www.angelikafilmcenter.com/villageeast/showtimes-and-tickets/special-screen/black-and-white/coming-soon`)
    const body = await res.text()
    const $ = cheerio.load(body)
    const films = $('div.film.status-advance_tickets')
    for (let i = 0; i < films.length; i++) {
      const film = films[i]
      const url = $(film).find('h4').find('a').attr('href')
      const summary = $(film).find('h4').text().trim()
      const description = $(film).find('div.desc').find('p').text().trim()
      const showtimes = $(film).find('div.showtimes-wrapper').find('form')
      for (const t of showtimes) {
        const ttime = $(t).find('input.showtime').attr('data-iso8601')
        const dtstart = new Date(ttime)
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtend.getHours() + 2)
        events.events.push({
          summary,
          dtstart,
          dtend,
          location: 'Village East by Angelika, 181 2nd Ave. New York, NY, 10003',
          description: `${description} ${url}`,
          url,
        })
      }
    }
    return events
  }
} as Curator
