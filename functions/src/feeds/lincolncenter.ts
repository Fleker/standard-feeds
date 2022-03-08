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
      calendarName: 'Lincoln Center In-Person and Online Events',
      lastBuildDate: new Date(),
      icon: 'https://www.lincolncenter.org/assets/images/favicon.ico?v=v7.11.3',
      link: 'https://www.lincolncenter.org/lincoln-center-at-home',
      defaultTimeZone,
      events: []
    }

    // Also see https://www.lincolncenter.org/lincoln-center-at-home/getAjex/2021%2005%2023/home
    const res = await fetch.default('https://www.lincolncenter.org/lincoln-center-at-home')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('.upcoming-shows-rows')
    for (let i = 0; i < eventsByDate.length; i++) {
      const dataLong = $(eventsByDate[i]).attr('data-long')
      const date = getTime(dataLong)
      const todayEvents = $(eventsByDate[i]).children('.featured-show')
      for (let j = 0; j < todayEvents.length; j++) {
        const event = $(todayEvents[j]).children('.featured-show-cont')
        const eventTime = $(event).children('.featured-show-time').text()
        const time = getTime(`${dataLong} ${eventTime}`)
        const dtstart = new Date(date)
        dtstart.setHours(time.getHours())
        dtstart.setMinutes(time.getMinutes())
        const dtend = new Date(dtstart)
        dtend.setHours(dtstart.getHours() + 1) // Assume
        dtend.setMinutes(dtstart.getMinutes() + 30) // Assume
        const showInfo = $(event).children('.featured-show-info')
        const summary = $(showInfo).children('.show-info-headings').children('.heading-lg').text()
        const headingSms = $(showInfo).children('.show-info-headings').children('.heading-sm')
        const category = $(headingSms[0]).text().trim().replace(/\n/g, ' ')
        const location = $(headingSms[1]).text()
        const description = $(showInfo).children('p.show-info-description').text()
        const ctaUrl = $(showInfo).children('.show-info-ctas').children('.show-info-cta').children('a').attr('href')
        const ctaLabel = $(showInfo).children('.show-info-ctas').children('.show-info-cta').children('a').attr('aria-label')

        // Exit broken events
        if (!summary || summary === '') continue

        events.events.push({
          dtstart,
          dtend,
          summary,
          location,
          description: `${description}\n${ctaLabel}\n${ctaUrl}`,
          categories: [category],
          url: ctaUrl,
        })
      }
    }

    return events
  }
} as Curator
