/**
 * Curator
 */

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
      calendarName: 'TCG Pocket Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.serebii.net/tcgpocket/events.shtml')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('table.dextab tr')
    for (let i = 2; i < eventsByDate.length; i++) {
      const event = $(eventsByDate[i])
      // const summary = $(event).find('h2').text().trim()
      const summary = $(event).find('a').text().trim()
      if (summary === '') continue
      // const description = $(event).find('.featured-article-preview__intro').text().trim()
      const description = ''
      const url = `https://serebii.net/tcgpocket/${$(event).find('a').attr('href')}`
      const datespan = $(event).find('.fooinfo')
      const datetext = $(datespan[1]).text().trim().split(' - ')
      // console.log(datetext)
      // const dtstart = new Date($(datespan).attr('data-start'))
      // const dtend = new Date($(datespan).attr('data-end'))
      const dtstart = getTime(datetext[0])
      const dtend = getTime(datetext[1])

      events.events.push({
        summary,
        dtend,
        dtstart,
        description,
        location: 'TCG Pocket',
        url,
      })
    }

    return events
  }
} as Curator
