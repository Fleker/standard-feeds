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
      calendarName: 'Jazz Age Concerts',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://secretnyc.co/jazz-age-concerts-nyc-rooftop-mondrian/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('.profile-card__plan-container')
    for (let i = 0; i < eventsByDate.length; i++) {
      const card = $(eventsByDate[i])
      const summary = $(card).find('.profile-card__new-plan-title').text().trim()
      const dtstart = getTime($(card).find('.profile-card__dates-popup').text())
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 2) // Assume
      const location = $(card).find('[data-action="profile_card_location"]').text()
      const cost = $(card).find('strong').text()
      const url = $(card).find('[data-action="profile_card_ticket"]').attr('href')
      const description = `${cost} ${url}`
      events.events.push({
        summary,
        description,
        location,
        dtstart,
        dtend,
        url,
      })
    }

    return events
  }
} as Curator
