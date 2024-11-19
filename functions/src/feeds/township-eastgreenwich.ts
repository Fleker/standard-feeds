/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const res = await fetch.default("https://www.eastgreenwichnj.com/government/township-meetings")
  const pHtml = await res.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)

  const rows = $('div > section')
  const posts: RssArticle[] = []
  // console.log('found', rows.length)
  const links = $(rows[10]).find('p > a')
  // console.log('found', links.length)
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const title = $(link).text().trim()
    if (!title.startsWith('Regular Meeting')) continue
    const date = title.substring(16)
    const pubDate = new Date(date)
    const href = $(link).attr('href')
    posts.push({
      authors: ['East Greenwich Township Council'],
      guid: `${pubDate.toDateString()}`,
      link: href,
      content: `View minutes at ${href}`,
      pubDate,
      title: `East Greenwich Township Council Minutes ${date}`
    })
    // const rowLinks = $(row).find('a')
    // for (let j = 0; j < rowLinks.length; j++) {
    //   const title = $(rowLinks[j]).text()
    //   if (title !== 'Minutes') continue
    //   const cols = $(row).find('td')
    //   const currentYear = new Date().getFullYear()
    //   const date = `${$(cols[0]).text().replace('*Town Hall Meeting, ', '')} ${currentYear}`
    //   const pubDate = new Date(date)
    //   if (isNaN(pubDate.getTime())) continue
    //   const link = $(rowLinks[j]).attr('href')
    //   posts.push({
    //     authors: ['Woolwich Township Council'],
    //     guid: `${pubDate.toDateString()}`,
    //     link,
    //     content: `View minutes at ${link}`,
    //     pubDate,
    //     title: `Woolwich Township Council Minutes ${date}`
    //   })
    // }
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
        title: 'East Greenwich Township Government Minutes',
        icon: 'https://lh4.googleusercontent.com/zMkY4fmmkFlI4-rBsVlon_zMjLZ7dGP4jBhkYK4LJuNbuM2qDCcEK0q6dqr4wcOB5SsAvB2SgURiIPu9yxhmdcQ=w16383',
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
