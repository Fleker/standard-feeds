/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const wdeptford = 'https://mantuatownship.com/government/township-committee/township-committee-agenda-minutes/'
  const pFetch = await fetch.default(wdeptford)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)


  const rows = $('ul.accordion > li.accordion-item')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const accordionTitle = $(row).find('a.accordion-title').text()
    if (accordionTitle.includes('Minutes')) {
      const events = $(row).find('a.accordion__link.pdf-file')
      for (let j = 0; j < events.length; j++) {
        const event = events[j]
        const title = $(event).text()
        const pubDate = new Date(title)
        const link = $(event).attr('href')
        posts.push({
          authors: ['Mantua Township Council'],
          guid: `${pubDate.toDateString()}`,
          link,
          content: `View minutes at ${link}`,
          pubDate,
          title: `Mantua Township Council Minutes ${title}`
        })
      }
    }
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
        title: 'Mantua Township Government Minutes',
        icon: 'https://mantuatownship.com/wp-content/uploads/2018/02/FINAL_logo.png',
      }
  
      if (key === 'township') {
        const mantua = await parseBoroMinutes()
        rss.entries.push(...mantua)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
