/**
 * Curator for https://pokeminers.com
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssFeed } from './rss';

export default {
  obtainFeed: async () => {
    const rss: RssFeed = {
      entries: [],
      lastBuildDate: new Date(),
      link: 'https://pokeminers.com/',
      title: 'Pokeminers',
      icon: 'https://pokeminers.com/static/favicon/favicon-32x32.png',
    }

    const res = await fetch.default('https://pokeminers.com/reports/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const posts = $('table.table-striped tr')

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const firstRow = $(post).children('th')
      const secondRow = $(post).children('td')[0]
      const thirdRow = $(post).children('td')[1]
      const link = $(firstRow).children('a').attr('href')
      const title = $(firstRow).text().trim()
      const dateStr = $(thirdRow).text().trim().replace(/,/g, '')
      if (!dateStr.length) continue
      const pubDate = new Date(dateStr)
      const guid = link
      const author = 'Pokeminers'
      rss.entries.push({
        guid,
        title,
        content: $(secondRow).text(),
        link,
        pubDate,
        authors: [author],
      })
    }

    return rss
  }
} as Curator
