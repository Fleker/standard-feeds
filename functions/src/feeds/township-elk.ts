/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const res = await fetch.default(`https://elktownshipnj.gov/${new Date().getFullYear()}-township-committee-meeting-minutes/`)
  const pHtml = await res.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)

  const rows = $('div.fusion-text p')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const anchor = $(row).find('a')
    const link = $(anchor).attr('href')
    const title = $(anchor).text().trim()
    if (!title) continue;
    const pubDate = new Date(title.split(' ')[0])

    posts.push({
      authors: ['Elk Township Council'],
      guid: `elk-${pubDate.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate,
      title: title
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
        title: 'Woolwich Township Government Minutes',
        icon: 'https://woolwichtwp.org/wp-content/uploads/2024/07/woolwich_nj_logo_small_horizontal-475-dark.fw_.png',
      }
  
      if (key === 'township') {
        const boromin = await parseBoroMinutes()
        rss.entries.push(...boromin)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
