/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssFeed } from './rss';

export default {
  obtainFeed: async () => {
    const rss: RssFeed = {
      entries: [],
      lastBuildDate: new Date(),
      link: 'https://help.elgato.com/hc/en-us/search?query=popular+topics+announcement&utf8=%E2%9C%93',
      title: 'Elgato Releases',
      icon: 'https://theme.zdassets.com/theme_assets/2398201/add1d01e59f5ec6726ed8ed73a25fa17dee6c5f2.png',
    }

    const res = await fetch.default('https://help.elgato.com/hc/en-us/search?query=popular+topics+announcement&utf8=%E2%9C%93')
    const body = await res.text()
    const $ = cheerio.load(body)

    const posts = $('li.search-result')
    console.log(body)

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      // Handle weird encoding for the e
      const title = $(post).children('a').text()
      const url = $(post).children('a').attr('href')
      const guid =  url
      const link = url
      const author = 'Elgato Help'
      const content = $(post).children('div.search-result-description').text()
      rss.entries.push({
        guid,
        title,
        content,
        link,
        pubDate: new Date(),
        authors: [author],
      })
    }

    return rss
  }
} as Curator
