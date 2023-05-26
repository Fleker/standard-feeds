// https://www.congress.gov/search?q=%7B%22source%22%3A%22legislation%22%2C%22congress%22%3A%22all%22%2C%22bill-status%22%3A%22president%22%7D
// Pre-setup with many conditions

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssFeed } from './rss'

export default {
  obtainFeed: async () => {
    const rss: RssFeed = {
      entries: [],
      lastBuildDate: new Date(),
      link: 'https://www.congress.gov/search?q={%22source%22:%22legislation%22,%22congress%22:%22all%22,%22bill-status%22:%22president%22}&pageSize=250',
      title: 'Legislation on Presidential Desk',
      icon: 'https://www.congress.gov/apple-touch-icon-precomposed.png',
    }

    const res = await fetch.default(rss.link, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "if-modified-since": "Mon, 16 Jan 2023 00:04:38 GMT",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "__cf_bm=KS9bwAw83I6aT5QRaA2c9Ow6OrM4ptCwhmCwdHmPnJs-1673827478-0-ARq+N+fCFMBfXZDARPWNXYJvKwKEoHnmfVu3ECGYIMKrogL3UddC4UzXKgWTfheBSiecTwwr0lQ874WIYo/ZVDg=; __cfruid=35d6e7d4955e408a4bade6adb861679e516833fd-1673827478; KWICViewExpanded-search=true; KWICViewCompact-search=false; PHPSESSID=0c2c5616c88096b0d3740f612dd9b4bf; AMCVS_0D15148954E6C5100A4C98BC%40AdobeOrg=1; s_ecid=MCMID%7C19715004264912462791966799312808938167; s_cc=true; AMCV_0D15148954E6C5100A4C98BC%40AdobeOrg=179643557%7CMCIDTS%7C19374%7CMCMID%7C19715004264912462791966799312808938167%7CMCAAMLH-1674432273%7C9%7CMCAAMB-1674432273%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1673834674s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.5.0"
      },
      "body": null,
      "method": "GET"
    })
    const body = await res.text()
    const $ = cheerio.load(body)
    console.log(body)

    const orderedList = $('ol.basic-search-results-lists').children('li.expanded')
    console.log('Found', orderedList.length, 'items')
    for (let i = 0; i < orderedList.length; i++) {
      const item = orderedList[i]
      const heading = $(item).children('span.result-heading')
      const link = `https://congress.gov${$(heading).children('a').attr('href')}`
      const suffix = $(heading).text()
      const titleEl = $(item).children('span.result-title')
      const title = `${$(titleEl).text()} — ${suffix}`
      const resultItems = $(item).children('span.result-item')
      let description = ''
      for (let j = 0; j < resultItems.length - 1; j++) {
        description += $(resultItems[j]).text() + '<br><br>'
      }
      const sponsor = $(resultItems[0]).children('a').text()
      // This is a bit flaky.
      let pubDate = new Date(1)
      let pubDateMatch = $(resultItems[2]).text().match(/\d\d\/\d\d\/\d\d\d\d/)
      if (pubDateMatch?.length) {
        pubDate = new Date(pubDateMatch[0])
      } else {
        // Try another element
        pubDateMatch = $(resultItems[3]).text().match(/\d\d\/\d\d\/\d\d\d\d/)
        if (pubDateMatch?.length) {
          pubDate = new Date(pubDateMatch[0])
        }
      }
      rss.entries.push({
        // Sponsor
        authors: [sponsor.substring(0, sponsor.length - 1)],
        title,
        link,
        guid: '',
        content: description,
        pubDate,
      })
    }

    return rss
  }
} as Curator
