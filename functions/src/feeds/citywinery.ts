/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

// const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

async function getPage(pageNo: number) {
  const res = await fetch.default(`https://www.citywinery.com/newyork/Online/default.asp?sToken=1%2C86825af8%2C64a46e4e%2C64F29CF7-4CDE-4A14-BCCE-10AD3CF9205D%2CfavLj4b%2BQlzEQY7mb99rOFL3NrQ%3D&BOset::WScontent::SearchResultsInfo::current_page=${pageNo}&doWork::WScontent::getPage=&BOparam::WScontent::getPage::article_id=B803B7F8-38FB-40B1-B2B9-25C6C8FB271D`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "AV-Cookie=!pTtlTkmTpAAGYqQdgnRIBwjCfes0hIR1nbFAEfI6B2u+YwTQFv6R4UM6S/6suFB8f8qA4FYt3RajwNI=; _gcl_au=1.1.237451977.1688497036; __cf_bm=8yeiW1dKI66p0M2k25nFPvp_8QeSDyYjgaB.mX00pAs-1688497035-0-AXn3wXCNLjbKOdvVkvKvkehemMQDB5sdZyYgemIUHyfJ/gKR5u1TxG9qPVnRvUoImw==; _gid=GA1.2.1825659134.1688497036; conv_person={\"$visitNum\":2,\"$fvDate\":1678145891,\"$lvDate\":1678145891}; _fbp=fb.1.1688497036029.699339888; __attentive_id=c52006e3541e45549633b714b4f815c7; _attn_=eyJ1Ijoie1wiY29cIjoxNjg4NDk3MDM2MTA3LFwidW9cIjoxNjg4NDk3MDM2MTA3LFwibWFcIjoyMTkwMCxcImluXCI6ZmFsc2UsXCJ2YWxcIjpcImM1MjAwNmUzNTQxZTQ1NTQ5NjMzYjcxNGI0ZjgxNWM3XCJ9In0=; __attentive_cco=1688497036109; __attentive_ss_referrer=https://www.google.com/; __attentive_dv=1; _vt_user=3875115519296924_1_false_false; _vt_shop=2170; CYB_AB=0; cybSessionID=1; CYB_ID=3875115519296924; c_64ei=ZmFsc2U=; ASPSESSIONIDCERGTQTB=MADKDHEBKNBHLLDNCJDELBML; _gcl_aw=GCL.1688497743.Cj0KCQjwho-lBhC_ARIsAMpgMoeEN9zDrRVrePJH5umAA28FKArvvYg1BCAcz_fLfDtgKTuotFdwCrcaAu89EALw_wcB; _gac_UA-5843861-4=1.1688497743.Cj0KCQjwho-lBhC_ARIsAMpgMoeEN9zDrRVrePJH5umAA28FKArvvYg1BCAcz_fLfDtgKTuotFdwCrcaAu89EALw_wcB; TS01a6bd37031=0183e8130ba8ba4951eb6bba038fb30a3273c357da87115c4b14c6ef7a47f10b4980d379c182351aaaedc0add2b64685d99705263b; QueueITAccepted-SDFrts345E-V3_fullwebsite092121=EventId%3Dfullwebsite092121%26QueueId%3D7f7d9204-ba3e-4e79-864f-ffb5be39eb63%26RedirectType%3Dsafetynet%26IssueTime%3D1688498229%26Hash%3D33c0d55fa1b2f556ab84a714e00438fe98627e8200f9795adc0c5a8ac3eb3578; TS01a6bd37=01cf42f8a69979e543ed8d9d4a21f9b3d31c15dfebf093d6dd821feba0dd824c9debf62662e3a9a2d4c64420ff94e709217e63ef2c879caa8896d28ba33d8c89001e86ec2f72bd47df50d7877e4978de316c01a1e8; conv_session={\"start\":1688497035,\"shown\":[],\"startUrl\":\"https://www.citywinery.com/newyork/Online/default.asp?BOparam::WScontent::loadArticle::permalink=newyork-buy-tickets&BOparam::WScontent::loadArticle::context_id=&gad=1&gclid=Cj0KCQjwho-lBhC_ARIsAMpgMoeEN9zDrRVrePJH5umAA28FKArvvYg1BCAcz_fLfDtgKTuotFdwCrcaAu89EALw_wcB\",\"referrer\":\"https://www.google.com/\",\"expires\":1688500297,\"isNew\":false,\"pageViews\":11}; __attentive_pv=11; _ga_4QGPZ6P9NP=GS1.1.1688497035.1.1.1688498529.27.0.0; _ga=GA1.2.1702196774.1688497036; _gat_UA-5843861-4=1",
      "Referer": "https://www.citywinery.com/newyork/Online/default.asp",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET",
    redirect: 'follow',
    follow: 100,
  });
  const body = await res.text()
  console.log(body)
  return body
    .replace(/[\s\S]+?articleContext =/, '')
    .replace(/createSearchMapping[\s\S]*/, '')
    // Sanitize to JSON
    .replace(/(\S+)\s?:\s?\[/g, '"$1": [')
    .replace(/(\S+)\s?:\s?{/g,  '"$1": {')
    .replace(/(\S+)\s?:\s?"([^,])/g,  '"$1": "$2')
    .replace(/\\'/g, "'")
    .replace('};', '}')
    .trim()
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'City Winery',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    for (let i = 0; i < 1; i++) {
      const res = await getPage(i)
      const {searchResults} = JSON.parse(res)
      for (let j = 0; j < searchResults.length; j++) {
        const summary = searchResults[j][6]
        const info = searchResults[j][5]
        const dtstart = getTime(searchResults[j][7])
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtend.getHours() + 2)
        const url = `https://citywinery.com/newyork/Online/${searchResults[j][18]}`
        const available = searchResults[j][39]
        const description = `(${available}) ${info} ${url}`
        const location = `${searchResults[j][40]} ${searchResults[j][52]} ${searchResults[j][53]} ${searchResults[j][55]}`

        events.events.push({
          summary,
          dtstart,
          dtend,
          description,
          location,
          url,
        })
      }
    }

    return events
  }
} as Curator
