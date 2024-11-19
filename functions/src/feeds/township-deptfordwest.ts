/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const wdeptford = 'https://www.westdeptford.com/government/meeting_agendas/township_committee.php'
  const pFetch = await fetch.default(wdeptford)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)


  const rows = $('div#post table tr')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const cols = $(row).find('td')
    if (cols.length === 1) continue // No meeting minutes yet
    const rowDate = $(cols[0]).text().trim().split(' ')[0]
    const title = $(cols[0]).text().trim()
    const link = $(cols[1]).find('a').attr('href')
    if (link === undefined) continue
    const postDate = new Date(rowDate)
    posts.push({
      authors: ['West Deptford Township Committee'],
      guid: `${postDate.toDateString()}`,
      link: `https://westdeptford.com/${link}`,
      content: `https://www.westdeptford.com/${link}`,
      pubDate: postDate,
      title: `West Deptford Township Committee ${title}`
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
        title: 'West Deptford Government Minutes',
        icon: 'https://www.westdeptford.com/_assets_/images/logo.png',
      }
  
      if (key === 'township') {
        const wdeptford = await parseBoroMinutes()
        rss.entries.push(...wdeptford)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
