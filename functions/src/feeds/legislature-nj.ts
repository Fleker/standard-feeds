/**
 * Curator for https://serebii.net
 */

import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

type BillRes = [
  [{
    Bill: string
    Synopsis: string
    /** Last date of action?? */
    LDOA?: string
    GovernorAction: string
  }],
  [{
    BillCount: number
  }]
]

async function performLegislatureSearch(searchKey: string, searchYear: number): Promise<BillRes> {
  const res = await fetch.default(`https://www.njleg.state.nj.us/api/billSearch/combinedSearch/empty/empty/empty/${searchKey}/empty/empty/${searchYear}`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "_ga=GA1.1.776829408.1763574682; _ga_THC4TPD62N=GS2.1.s1763574681$o1$g1$t1763574705$j36$l0$h0",
      "Referer": "https://www.njleg.state.nj.us/bill-search"
    },
    "body": null,
    "method": "GET"
  });
  return await res.json()
}

async function getBillsFeed(searchKey: string, searchYear: number, title: string): Promise<RssArticle[]> {
  const data = await performLegislatureSearch(searchKey, searchYear)
  const listOfBills = data[0]
  const posts: RssArticle[] = []

  for (const bill of listOfBills) {
    posts.push({
      authors: ['NJ State Legislature'],
      content: `
        <strong>${bill.Bill.trim()}</strong>
        <br>
        <p>
          ${bill.Synopsis}
        </p>
      `,
      link: `https://www.njleg.state.nj.us/bill-search/${searchYear}/${bill.Bill.trim()}`,
      guid: `njleg-${searchYear}-${bill.Bill.trim()}`,
      pubDate: bill.LDOA ? new Date(bill.LDOA) : new Date(),
      title: `${title} ${bill.Bill.trim()}`,
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
        title: 'NJ Legislature Bills',
        icon: 'https://www.westdeptford.com/_assets_/images/logo.png',
      }

      const searchYear = (() => {
        const currentYear = new Date().getFullYear()
        if (currentYear % 2 === 1) {
          // Legislative sessions are every two years
          return currentYear - 1
        }
        return currentYear
      })()

      // Passed both houses
      const toGovernor = await getBillsFeed('PBH', searchYear, `NJ Legislature Passes`)
      rss.entries.push(...toGovernor)

      // Approved by governor
      const signed = await getBillsFeed('APP', searchYear, `Governor Signs`)
      rss.entries.push(...signed)
  
      return rss
    }
  } as Curator
}

export default getFeed
