/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const pitman = 'https://www.pitman.org/elected_officials/mayor___council/borough_council_agendas___minutes.php'
  const pFetch = await fetch.default(pitman)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)


  // const links = $('table.table').find('a').filter(a => $(a).text().endsWith('Minutes'))
  const rows = $('div#post table.table')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstRow = $(row).find('td')[0]
    // const secondRow = $(row).find('td')[1]
    const links = $(row).find('a')
    const rowDate = $(firstRow).text()
      .replaceAll('Meetings', '')
      .replaceAll('Reorganization Meeting', '')
      .replaceAll('Regular Meeting', '')
      .replaceAll('Special Meeting', '')
      .trim()
    const postDate = new Date(rowDate)
    if (Number.isNaN(postDate.getTime())) {
      continue
    }
    // console.log($(firstRow).html(), $(secondRow).html())
    for (let j = 0; j < links.length; j++) {
      const link = links[j]
      const label = $(link).text()
      // console.log(`"${rowDate}"`, `"${label}"`)
      // console.log($(link).attr('href'))
      // console.log($(link).html())
      if (label === 'Reg. Minutes' || label === 'Work Minutes') {
        posts.push({
          authors: ['Pitman Borough Council'],
          guid: `${postDate.toDateString()}-${label}`,
          link: `https://cms5.revize.com/revize/pitman/${$(link).attr('href')}`,
          content: `https://www.pitman.org/${$(link).attr('href')}`,
          pubDate: postDate,
          title: `Pitman ${label}, ${postDate.toDateString()}`
        })
      }
    }
  }
  return posts
}

async function parseBoEMinutes() {
  const url = 'https://www.pitman.k12.nj.us/site/default.aspx?PageType=14&DomainID=26&PageID=183&ModuleInstanceID=3314&ViewID=1e008a8a-8e8a-4ca0-9472-a8f4a723a4a7&IsMoreExpandedView=True'
  const pFetch = await fetch.default(url)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)
  const allLinks = $('h1.ui-article-title a')
  console.log(allLinks.length)
  const posts: RssArticle[] = []
  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i]
    const href = $(link).attr('href')
    if (href === '#') continue
    const fullUrl = href.replace('../../', 'https://www.pitman.k12.nj.us/')
    // const fullUrl = href
    posts.push({
      title: `Pitman BoE Minutes - ${$(link).text().trim()}`,
      pubDate: new Date($(link).text().trim()),
      authors: ['Pitman BoE'],
      content: `PDF Meeting available at ${fullUrl}`,
      link: fullUrl,
      guid: $(link).attr('data-ally-file-eid')
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
        title: 'Pitman Government Minutes',
        icon: 'https://images.squarespace-cdn.com/content/v1/577196f35016e1776170568d/1476126101553-O3MYV288IPSHSDHGB4CJ/glassboro-logo-green-name.png?format=1500w',
      }
  
      if (key === 'pitman') {
        const pitman = await parseBoroMinutes()
        rss.entries.push(...pitman)
      } else if (key === 'pitmanboe') {
        const pitman = await parseBoEMinutes()
        rss.entries.push(...pitman)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
