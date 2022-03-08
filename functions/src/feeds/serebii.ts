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
      link: 'https://serebii.net/index2.shtml',
      title: 'Serebii.Net',
      icon: 'https://www.serebii.net/favicon.ico',
    }

    const res = await fetch.default('https://serebii.net')
    const body = await res.text()
    const $ = cheerio.load(body)

    const posts = $('.post')

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      // Handle weird encoding for the e
      const title = $(post).children('h2').text()
        .replace(/�/g, 'é')
        .replace(/&/g, 'and')
      const id = $(post).children('h2').children('a').attr('id')
      const guid =  `${id}::${title.length}`
      const href = $(post).children('h2').children('a').attr('href')
      const link = `https://serebii.net${href}`
      const author = $(post).children('p.info').children('span.user').text()
      rss.entries.push({
        guid,
        title,
        content: $(post).html().replace(/�/g, 'é'),
        link,
        pubDate: new Date(id.replace(/-/g, ' ')),
        authors: [author],
      })
      // const title = $(post).$('h2').text()
    }

    return rss
  }
} as Curator
