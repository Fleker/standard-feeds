/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

const cheerio = require('cheerio')
// const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

// function getTime(str: string) {
//   const spacetimeDate = spacetime(str, defaultTimeZone)
//   return new Date(spacetimeDate.toLocalDate())
// }

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'My Trakt Calendar',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default("https://trakt.tv/calendars/my/shows-movies/2025-04-30", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "webp_supported=true; _ga=GA1.1.841411214.1736293354; user_data_version=12; _traktconsent=%7B%22categories%22%3A%5B%22necessary%22%2C%22functionality%22%2C%22analytics%22%2C%22advertising%22%5D%2C%22revision%22%3A4%2C%22data%22%3A%7B%22expiration%22%3Anull%2C%22saved%22%3A%22Sat%2C+28+Dec+2024+16%3A44%3A03+GMT%22%7D%2C%22consentTimestamp%22%3A%222024-12-28T16%3A44%3A03.756Z%22%2C%22consentId%22%3A%226db97386-7622-441a-a538-a8b6c21b40c2%22%2C%22services%22%3A%7B%22necessary%22%3A%5B%5D%2C%22functionality%22%3A%5B%5D%2C%22analytics%22%3A%5B%5D%2C%22advertising%22%3A%5B%5D%7D%2C%22lastConsentTimestamp%22%3A%222024-12-28T16%3A44%3A03.756Z%22%2C%22expirationTime%22%3A1751129043756%7D; watchnow_country=us; prefers_dark_mode=true; cf_clearance=KLBTwebvE_r10F1wj0h5ovmqPFYS3EPkuAz9szIZgRY-1746055639-1.2.1.1-lvaOJxIo1mO5z.wmwFG97GNbbA4zGvWQcWqzCDGlHOTSv5RyP4peSDnRBHEZ_UuNoPgPr.KjYWikI3o5U_RW2o4zlz4uhD.UWLYSHSaFFKPQycDYs3p6aTHUzlRPXi_hhxKcPxQDYXvfaWHpaaXvJnw4orY3stehUrYgioT955rU3ZqLDD8P3LOZhnjzwyJiqPKEgA_NLHRAywDNygAw4lEBrHpM39xIl8kGdv3BJWgeU9CvCWGlJyK07I1ORfFpO6RDORkndAfkGzXD_rKRpgQ0V8QJDLI5gRMpF4vbEExChpR7QFPmke5jaZqOB3awi.DaumByd7Gfw6AkjYwftNAnGltOwJgjMo8fh5_qR9k; trakt_username=fleker; trakt_userslug=fleker; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6Ilcxc3hNemN5TmpZMk5GMHNJaVF5WVNReE1DUjRNM1JYUm1waWVteDRZemhsYTI1a2FrOXJjMVZQSWl3aU1UYzBOakExTlRZMk1DNDNOamcyTkRZeUlsMD0iLCJleHAiOiIyMDI1LTA1LTMwVDIzOjI3OjQwLjc2OFoiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdXNlcl90b2tlbiJ9fQ%3D%3D--a40e099744acaa9cadb2f5195acbe541b6a301c3; _ga_P0MZD21D9P=GS1.1.1746055639.2.1.1746055804.0.0.0; _traktsession=nvvsK17j6u3VGw55XHfDXigreB%2Fr%2B8cNWZEPuOuzlOoGf0miEE9so3p2E3hqtJ5HVvEShOpxO3Ckjsijxhpzh9BEG%2F1jMrXOc4aeK4sLBQ2cD7rE88eL1tIboGWAQTDyuRE%2BXHBxUrTff9bYaCcgf6%2F2uGUEGXfAlMd9CHrH4%2B8SvyLqhQs5Zr66RjwF57bV2mtL%2F4Uxvt3g0ETCfrdv7Ey0ITQAjhPQZVlsB2BM2RmFNJi3WUVH3fXrddOqm%2FfXumgR4YE2CEIh%2BD0%2BF9QwYequQfXJz%2F9LRC2AWnu4ii%2BMBHQK82unMtSq8eHh4Mii%2F4RsBrQbHDaa0eFV9LkdwJ4nE5rb%2B8svpPCdu7nkQdjyzyQLcBkJJlUO8gCPb9RwOstjiqacRVEDiwbLeTnr%2B%2FvuPqlmBXJjHvPksbvzYt%2F2YHbMEmht6DvDCyUV8Vb6cxMFCqVRqFauvizKTkkAiy%2F7%2F9rPh1QRFCLYzzV6MmnPMAHJORBOAVyixJgGD03c5LdNvEgz%2Bu6GIpBCulk5X9J5ANzX1SgleEUGeQvH0DxHGxELJI4aIXITmdcYRUkYSkIF8DHnFnab--f10eP%2BPAKAm3Zb%2FX--liJqqHyvGLtUgfgSy4Z4Qg%3D%3D; _ga_D4G2HYQQ8T=GS1.1.1746055661.2.1.1746055804.0.0.0",
        "Referer": "https://trakt.tv/calendars/my/shows/2025-04-30",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });
    const body = await res.text()
    // console.log(body)
    const $ = cheerio.load(body)
    const entries = $('div[itemtype="http://schema.org/TVEpisode"]')
    for (let i = 0; i < entries.length; i++) {
      const entry = $(entries[i])
      const meta = $(entry).find('meta[itemprop="url"]')
      const url = $(meta).attr('content')
      const pubDate = $(entry).find('meta[itemprop="datePublished"]')
      const dtstart = new Date($(pubDate).attr('content'))
      const dtend = new Date(dtstart.getTime() + 1000 * 60 * 60)
      const title = $(entry).find('h3').text().trim()
      const show = $(entry).find('span[itemprop="partOfSeries"]')
        .find('meta[itemprop="name"]').attr('content')
      let description = `${url}`
      let summary = title
      if (show) {
        summary = `${show} ${summary}`
        description += `\n\n${show}`
      }


      events.events.push({
        dtend,
        dtstart,
        description,
        summary,
        url,
      })
    }

    return events
  }
} as Curator
