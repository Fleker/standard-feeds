/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const wdeptford = 'https://www.franklintownshipnj.org/AgendaCenter/Search/?term=&CIDs=8,3,&startDate=&endDate=&dateRange=&dateSelector='
  const pFetch = await fetch.default(wdeptford)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)


  const rows = $('tr.catAgendaRow')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const label = $(row).find('strong')
    const minutes = $(row).find('td.minutes')
    if ($(minutes).html().length === 0) continue
    const rowDate = $(label).text().trim()
    const title = rowDate
    const link = $(minutes).find('a').attr('href')
    if (link === undefined) continue
    const postDate = new Date(rowDate)
    posts.push({
      authors: ['West Deptford Township Committee'],
      guid: `${postDate.toDateString()}`,
      link: `https://franklintownshipnj.org/${link}`,
      content: `https://www.franklintownshipnj.org/${link}`,
      pubDate: postDate,
      title: `Franklin Township Committee Minutes ${title}`
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
        title: 'Franklin Township Government Minutes',
        icon: 'https://www.franklintownshipnj.org/ImageRepository/Document?documentID=5504',
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
