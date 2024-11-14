/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const township = 'https://monroetownshipnj.org/township-council/regular-council-meetings/'
  const res = await fetch.default(township)
  const html = await res.text()
  // console.log(pHtml)
  const $ = cheerio.load(html)

  const rows = $('.fusion-text-2 a')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const link = $(row).attr('href')
    const dateTitle = ($(row).text().split(' '))[0]
    const pubDate = new Date(dateTitle)
    posts.push({
      authors: ['Township of Monroe Council'],
      guid: `${pubDate.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate,
      title: `Council Meeting Minutes ${dateTitle}`
    })
  }
  return posts
}

const getFeed = (key: string) => {
  return {
    obtainFeed: async () => {
      const rss: RssFeed = {
        entries: [],
        lastBuildDate: new Date(),
        link: 'https://gloucestercounty.substack.com',
        title: 'Township of Monroe Government Minutes',
        icon: 'https://monroetownshipnj.org/wp-content/uploads/2020/07/Monroe-Township-Logo-2020-1.png',
      }
  
      if (key === 'township') {
        const township = await parseBoroMinutes()
        rss.entries.push(...township)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
