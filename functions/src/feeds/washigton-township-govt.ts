/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

function getUrlEl($: Function, row: any): string | undefined {
  const urls = $(row).find('a')
  for (let j = 0; j < urls.length; j++) {
    const text = $(urls[j]).text().trim()
    if (text === 'Minutes') {
      return urls[j]
    }
  }
  return undefined
}

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const township = 'https://www.twp.washington.nj.us/government/township_council/agendas_and_minutes.php'
  const res = await fetch.default(township)
  const html = await res.text()
  // console.log(pHtml)
  const $ = cheerio.load(html)

  // const links = $('table.table').find('a').filter(a => $(a).text().endsWith('Minutes'))
  const rows = $('table > tbody > tr')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstRow = $(row).find('td')[0]
    const urlEl = getUrlEl($, row)
    if (!urlEl) continue
    const dateTitle = $(firstRow).text().trim().split(' ')[0].trim()
    // console.log($(firstRow).text().trim().split(' '))
    const pubDate = new Date(dateTitle)
    const link = `https://cms2.revize.com/revize/washingtontownshipnj/${$(urlEl).attr('href')}`
    posts.push({
      authors: ['Washington Township Council'],
      guid: `${pubDate.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate,
      title: $(firstRow).text().trim(),
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
        title: 'Washington Township Government Minutes',
        icon: 'https://www.twp.washington.nj.us/_assets_/images/logo.png',
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
