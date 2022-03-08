/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

// const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

async function getPage(pageNo: number) {
  const res = await fetch.default(`https://citywinery.com/newyork/Online/default.asp?BOset::WScontent::SearchResultsInfo::current_page=${pageNo}&doWork::WScontent::getPage=&BOparam::WScontent::getPage::article_id=B803B7F8-38FB-40B1-B2B9-25C6C8FB271D`)
  const body = await res.text()
  return body
    .replace(/[\s\S]+?articleContext =/, '')
    .replace(/createSearchMapping[\s\S]*/, '')
    // Sanitize to JSON
    .replace(/(\S+)\s?:\s?\[/g, '"$1": [')
    .replace(/(\S+)\s?:\s?{/g,  '"$1": {')
    .replace(/(\S+)\s?:\s?"([^,])/g,  '"$1": "$2')
    .replace(/\\'/g, "'")
    .replace('};', '}')
    .trim()
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'City Winery',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    for (let i = 0; i < 1; i++) {
      const res = await getPage(i)
      const {searchResults} = JSON.parse(res)
      for (let j = 0; j < searchResults.length; j++) {
        const summary = searchResults[j][6]
        const info = searchResults[j][5]
        const dtstart = getTime(searchResults[j][7])
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtend.getHours() + 2)
        const url = `https://citywinery.com/newyork/Online/${searchResults[j][18]}`
        const available = searchResults[j][39]
        const description = `(${available}) ${info} ${url}`
        const location = `${searchResults[j][40]} ${searchResults[j][52]} ${searchResults[j][53]} ${searchResults[j][55]}`

        events.events.push({
          summary,
          dtstart,
          dtend,
          description,
          location,
          url,
        })
      }
    }

    return events
  }
} as Curator
