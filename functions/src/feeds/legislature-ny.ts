/**
 * Curator for https://serebii.net
 */

import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';
const cheerio = require('cheerio')

async function performLegislatureSearch(actionDate: Date, searchYear: number): Promise<string> {
  const endDate = actionDate.toISOString().split('T')[0]

  const res = await fetch.default("https://nyassembly.gov/leg/?sh=advanced", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "_ga=GA1.1.1443883789.1770664628; _ga_6RYKXL59GH=GS2.1.s1770664628$o1$g1$t1770666259$j42$l0$h0",
      "Referer": "https://nyassembly.gov/leg/?sh=advanced"
    },
    "body": `evt_fld=Search&by=a&term=${searchYear}&leg_type=B&house=&bill_text=&floor_vote=&comm_vote=&sess_cal=&comm_agenda=&mbrid=&comm_id=&law=&bill_status=D&start_date=${endDate}&end_date=${endDate}&num_days=`,
    "method": "POST"
  });
  return await res.text()
}

async function getBillsFeed(searchKey: string, searchYear: number, prefix: string): Promise<RssArticle[]> {
  const data = await performLegislatureSearch(new Date(), searchYear)
  const $ = cheerio.load(data)
  const listOfBills = $('#vcontent_div ul li')
  /*
  The HTML output looks like:

  <li style="margin-top:5px;margin-bottom:5px;">
    <a href="?bn=A00026&amp;term=2025" style="margin-right:10px;">A00026</a>
    Prohibits Medicaid from requiring prior authorization for certain HIV medications
  </li>
  */

  const posts: RssArticle[] = []

  for (const bill of listOfBills) {
    const title = $(bill).text().trim()
    const billNumber = $(bill).find('a').text().trim()
    if (!title) continue;
    posts.push({
      authors: ['NY State Legislature'],
      content: `
        <strong>${title}</strong>
      `,
      link: `https://nyassembly.gov/leg/?bn=${billNumber}&term=${searchYear}`,
      guid: `nyleg-${searchYear}-${billNumber}`,
      pubDate: new Date(), // No date provided, so just use the year
      title: `${prefix}: ${title}`,
    })
  }
  return posts
}

const getFeed = () => {
  return {
    obtainFeed: async () => {
      const rss: RssFeed = {
        entries: [],
        lastBuildDate: new Date(),
        link: 'https://gloucestercounty.substack.com',
        title: 'NY Legislature Bills',
        icon: 'https://www.westdeptford.com/_assets_/images/logo.png',
      }

      const searchYear = (() => {
        const currentYear = new Date().getFullYear()
        if (currentYear % 2 === 0) {
          // Legislative sessions are every two years
          // 2023-2024 or 2025-2026
          return currentYear - 1
        }
        return currentYear
      })()

      // Passed both houses
      const toGovernor = await getBillsFeed('PBH', searchYear, 'NY legislature passed')
      rss.entries.push(...toGovernor)
  
      return rss
    }
  } as Curator
}

export default getFeed
