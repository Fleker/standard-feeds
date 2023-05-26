/**
 * Curator for NY Minute Dating
 */

const spacetime = require('spacetime')
const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  // console.log(str)
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

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

    const res = await fetch.default(`https://www.nyminutedating.com/Events-OnlineSpeedDating.aspx`)
    const body = await res.text()
    const $ = cheerio.load(body)
    const items = $('table#DataList1 > tbody > tr')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const summary = $(item).find('span.Title').text().trim()
      const url = $(item).find('a').attr('href')
      const description = $($(item).find('tr')[6]).find('span').text().trim()
      const location = $($($(item).find('tr')[2]).find('td')[1]).text().trim().replace(/\s\s*/g, ' ')
      const dtstr = $($(item).find('tr')[1]).find('td').text().trim().replace(/\s\s*/g, ' ')
      // console.log('dtstr',summary, dtstr)
      const dtarr = dtstr.split('at ')
      dtarr[0] = dtarr[0].replace('Date', '')
      // console.log('dtarr', dtarr)
      const [start, end] = dtarr[1].split('-')
      const dtstart = getTime(`${dtarr[0]} ${start}`)
      const dtend = getTime(`${dtarr[0]} ${end}`)
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
