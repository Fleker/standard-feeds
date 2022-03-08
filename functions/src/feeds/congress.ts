// https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22all%22%2C%22bill-status%22%3A%22president%22%7D
// Pre-setup with many conditions

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssFeed } from './rss'

export default {
  obtainFeed: async () => {
    const rss: RssFeed = {
      entries: [],
      lastBuildDate: new Date(),
      link: 'https://www.congress.gov/search?q={%22source%22:%22legislation%22,%22congress%22:%22all%22,%22bill-status%22:%22president%22}&pageSize=250',
      title: 'Legislation on Presidential Desk',
      icon: 'https://www.congress.gov/apple-touch-icon-precomposed.png',
    }

    const res = await fetch.default(rss.link)
    const body = await res.text()
    const $ = cheerio.load(body)

    const orderedList = $('ol.basic-search-results-lists').children('li.expanded')
    for (let i = 0; i < orderedList.length; i++) {
      const item = orderedList[i]
      const heading = $(item).children('span.result-heading')
      const link = `https://congress.gov${$(heading).children('a').attr('href')}`
      const suffix = $(heading).text()
      const titleEl = $(item).children('span.result-title')
      const title = `${$(titleEl).text()} — ${suffix}`
      const resultItems = $(item).children('span.result-item')
      let description = ''
      for (let j = 0; j < resultItems.length - 1; j++) {
        description += $(resultItems[j]).text() + '<br><br>'
      }
      const sponsor = $(resultItems[0]).children('a').text()
      // This is a bit flaky.
      let pubDate = new Date(1)
      let pubDateMatch = $(resultItems[2]).text().match(/\d\d\/\d\d\/\d\d\d\d/)
      if (pubDateMatch?.length) {
        pubDate = new Date(pubDateMatch[0])
      } else {
        // Try another element
        pubDateMatch = $(resultItems[3]).text().match(/\d\d\/\d\d\/\d\d\d\d/)
        if (pubDateMatch?.length) {
          pubDate = new Date(pubDateMatch[0])
        }
      }
      rss.entries.push({
        // Sponsor
        authors: [sponsor.substring(0, sponsor.length - 1)],
        title,
        link,
        guid: '',
        content: description,
        pubDate,
      })
    }

    return rss
  }
} as Curator
