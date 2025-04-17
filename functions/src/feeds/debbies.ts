/**
 *
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

const getEvents = {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: `Debbies`,
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default(`https://www.dutchkillsbar.com/`)
    const body = await res.text()
    // console.log(body)
    const $ = cheerio.load(body)

    const items = $($('.wixui-box')[4]).find('[role="listitem"]')
    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      const lines = $(item).find('.wixui-rich-text')
      const line1 = $(lines[0]).text()
      const line2 = $(lines[1]).text()
      // console.log(line1, '   ', line2)
      const line2DT = line2.split('//').map(x => x.trim())
      const line2D = line2DT[0].split('.')
      const dateStr = `20${line2D[2]}/${line2D[0]}/${line2D[1]} ${line2DT[1]}`
      const dtstart = getTime(dateStr)
      // const date = getTime(line2DT[0] + ' ' + line2DT[1])
      // console.log(dateStr, dtstart)
      const dtend = new Date(dtstart.getTime() + 1000 * 60 * 60 * 2)
      const url = 'https://www.dutchkillsbar.com/'
      const description = url
      // const url = $(item).find('.product-link').attr('href')
      // const title = $(item).find('.product-item__title').text()
      // const tsplit = title.split('|')
      // const summary = tsplit[0].trim()
      // // 1.17.25 => 1-17-2025
      // const date = tsplit[1].replace('.', '-').replace('.', '-20')
      // const description = $(item).find('.product-item__price')
      //   .text()
      //   .trim()
      //   .replace(/\n/g, '')
      //   .replace(/\s+/g, ' ')
      // const dtstart = getTime(date)
      // const dtend = new Date(dtstart.getTime() + 1000 * 60 * 60 * 3)
      events.events.push({
        summary: line1,
        dtstart,
        dtend,
        description,
        url,
        location: 'Dutch Kill Bar',
      })
    }

    return events
  }
} as Curator

export default getEvents
