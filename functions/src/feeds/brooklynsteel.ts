/**
 * Curator for Brooklyn Steel (via Bowery Presents)
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
      calendarName: 'Brooklyn Steel Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Works for any Bowery Presents
    const res = await fetch.default('https://www.bowerypresents.com/info/events/get?scope=announced&page=0&rows=100&venues=brooklyn-steel')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('.show-item').children('.row')
    for (let i = 0; i < items.length; i++) {
      const showInfo = $(items[i]).children('.medium-9').children('.show-info')
      const summary = $(showInfo).children('.show-info-container')
        .children('.info-wrapper').children('.info-title').children('h3').children('a')
        .text().trim()
      const link = $(showInfo).children('.show-info-container').children('.info-wrapper').children('.info-title').children('h3').children('a').attr('href')
      const location = $(showInfo).children('.show-info-container').children('.info-list').children('li').children('.list-location').text()
        .replace(/\n/g, ' ').replace(/\s\s*/g, ' ').trim()
      const dateListItem = $(showInfo).children('.show-info-container').children('.info-list').children('li').children('.list-date').text().trim()
      const datePart = dateListItem.substring(0, dateListItem.indexOf('|')).trim()
      // const timePartDes = dateListItem.substring(dateListItem.indexOf('|') + 2).trim()
      const timePart = dateListItem.substring(dateListItem.indexOf('|')).replace(/.*Show:/, '').trim().replace(' PM', 'pm')
      const dtstart = getTime(`${datePart} ${timePart}`)
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 3) // Assume

      const otherInfo = $(showInfo).children('.show-info-container').children('.info-list').children('li').children('p').text().split('\n').map((x: string) => x.trim()).filter((x: string) => x).join('\n')

      events.events.push({
        summary,
        dtend,
        dtstart,
        description: `${otherInfo} -- https://www.bowerypresents.com${link}`.replace(/\n/g, ' '),
        location,
        url: `https://www.bowerypresents.com${link}`,
      })
    }

    return events
  }
} as Curator
