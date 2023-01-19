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
      calendarName: 'ArtHouse Hotel',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.arthousehotelnyc.com/live-at-arthouse')
    const body = await res.text()
    const $ = cheerio.load(body)

    const items = $('div.m-content-object--list').children('[itemtype="https://schema.org/Event"]')
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const url = $(item).find('a').attr('href')
      const summary = $(item).find('[itemprop="name"]').text().trim()
      const body = $(item).find('[itemprop="description"]').text().trim()
      const blog = $(item).find('.blog-entry__date').text().trim()
        .replace(/\s+/g, ' ')
        .replace(/\n/g, ' ')
      const parser = new RegExp('every (\\w+) FROM (.+) TO (.+) FROM (.*) TO (.*)')
      const pattern = parser.exec(blog)
      // console.log(blog, pattern)
      // const [_, dow, dstart, dend, tstart, tend] = pattern
      // Doesn't repeat.
      const dstart = pattern[2]
      const tstart = pattern[4]
      const tend = pattern[5]
      const dtstart = getTime(`${dstart} ${tstart}`)
      const dtend = (() => {
        const dtend = getTime(`${dtstart} ${tend}`)
        if (tstart > tend) {
          // Add an extra day
          dtend.setDate(dtend.getDate() + 1)
        }
        return dtend
      })()
      events.events.push({
        summary,
        dtend,
        dtstart,
        description: `${body} ${blog} https://arthousehotelnyc.com${url}`,
        location: 'Arthouse Hotel NYC',
        url: `https://arthousehotelnyc.com${url}`,
      })
    }

    return events
  }
} as Curator
