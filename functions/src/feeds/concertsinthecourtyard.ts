/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

// const cheerio = require('cheerio')
const spacetime = require('spacetime')
// const puppeteer = require('puppeteer');
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Concerts in the Courtyard',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // const res = await fetch.default('https://www.instagram.com/concertsinthecourtyard/')
    const res = await fetch.default("https://www.instagram.com/concertsinthecourtyard/?__a=1", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ig_did=DDD9637E-A677-4D13-98AF-6CBD2A62F0C4; ig_nrcb=1; mid=YLKyFAALAAHkWTWePXCVo11DkV_m; fbm_124024574287414=base_domain=.instagram.com; csrftoken=enLdE8S1PyeiP7DHBjv4qNzh9QmM4NAZ; ds_user_id=29779164; sessionid=29779164%3Ausn9W8G958qh9v%3A24; shbid=14246; shbts=1623278635.1980884; rur=FTW; fbsr_124024574287414=8Nn6K8uOBPGXNEfaWXFsELB42RCowaXrXIxsA2JCdTI.eyJ1c2VyX2lkIjoiNTcxMTc1ODMxIiwiY29kZSI6IkFRQ1F2TUNWeC13MG9IRldySEVpVEVCdUkzM3lIMGhwX0JaVllJbkF4WlBzQ05LUmU0WjJSMXlvZ2FXU2RxM2xmMml6TkprT0lxdDA4NkxLVzV2em5SNXprSTI0b0o2d0k2WW8xQVZYRFVIVVY1LVVNNEJMTkVLZ0lKenlYbjN2OFJPS2J6V1lHemZRT0laTFZTeXdQOENvUXpPTlFPTG1fTEdUNkw2dVJyNE5YdkFTVDhXRXZzYk14TGtsYlNiU1lNeHpCbVZBaGd2QjJ4MnJoZjZueGtYR2FaaGRrcG5GUVB6a0pKS08yX2JfdnJCTHM3bktySW85bkdaVDM5R1ZQb21MUE5vaGEtdmhHVnp6Ykx0djV1aXEwOElkc0tXRDgtVEFUMHVta2ZvQTIyeTFSTXNlalJQT3QtZi1JWHYtdmRDdVV3dWJRYVRYOWhTQUVmX3N6Y01SUkVhLTh6dTRmTnNCYnJlX2F2MFgwQSIsIm9hdXRoX3Rva2VuIjoiRUFBQnd6TGl4bmpZQkFESE5IOEJjZEpZa3I4TVpDZGdUN2YwZDlrTzdlMVFjWkJxemxkY2xoeVN3RklXbDJsbnlOYUd4SjZOUWZZZ201d0NSdFpBZEEyMDd2Y2sxMTB1UVpCSmNvYlVBbGVvb21TWW8wWkJ6TXdaQ0RuWkM3aFZjc05aQlVCNHJ6MGhhTTl2QUpDM2JCaFpDbk5SakI4MElpWUNWZkFaQWxHbm5LMnU3WkFIZUJsUXFZUUoiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTYyMzI3ODYzNn0; fbsr_124024574287414=qU15-oLNZhbI-KU4ud9uiHbzYmUM6ab4QvM2YPMtqdI.eyJ1c2VyX2lkIjoiNTcxMTc1ODMxIiwiY29kZSI6IkFRQnZlME1fa1Z1aEo0cXhkeWdFNmc3U2lZektnUXZkV2JzQ1FpN3Azb3pndjNGMUMxVjl1QjFhVXF5RkhWUjFGU2V4Ry0xb2o2eGJNcnZpWmtRbUNiUnZMZ3Q1ZzFzN0xJcFplRnRhWGZRU01MRUdZeElDUThOdk5sUWVHejZycFBYQWwzUzdNTWlNdFdVSXlxRjNkNG9RLU5iSFhwcEdaSy03Sk9IUXVFdnEtVi0wQnlzMklONU5PZXY4bHloSnV5aW5zWnJiNkU3dHE4MUYtbkgxWkRnNUNsV0dhTlBJVzdxMjByaTVhWk5XOXhQSGVocnl6RkFnbkM1WEdXT3FoRExkaWU0NVlna2R2WjkxWVB0bEJoSjBEM2tSYndXenhhem5wR2dRbFc3MEVreWdEaVg0eU4tWm5yaE1TNG55SnM2ekIwRlNtc1JmSVZfcWJxN3FLZDFaWjJjZXg4NHhiMjdaTjA4U3g0N0VkQSIsIm9hdXRoX3Rva2VuIjoiRUFBQnd6TGl4bmpZQkFNa2h0VmZxanNqSEk1Q2tFZ3Rhc2l6bFMydFRJRFJpa0tTbG42S1U1a3RBRlpCMUd5MXJhd2Zmd1pBZ1h3S29oSnp5ZEFaQnE1VGNjdHNwdkFEUjVsYTdHYm5SWkNaQ1JFSUtkVTFzZThzdzBMRGozWDY3T1pBcFdPcUltZG9Db21OUjRkR1R0ZnRtZlpCNEU5MVpCWkJRWkFFTmpOWG84UU9VVUFQTmE4dE15TiIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjIzMjgwNTQwfQ"
      },
      "method": "GET",
    })
    const body = JSON.parse(await res.text())

    // const $ = cheerio.load(body)
    // Look for the sharedData entries
    // const sharedData = (() => {
    //   const scripts = $('script')
    //   for (let i = 0; i < scripts.length; i++) {
    //     const prelude = 'window._sharedData = '
    //     if ($(scripts[i]).html().trim().startsWith(prelude)) {
    //       const payload = $(scripts[i]).html()
    //       return JSON.parse(payload.substring(prelude.length, payload.length - 1))
    //     }
    //   }
    // })()
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.goto('https://www.instagram.com/concertsinthecourtyard/')
    const posts = body.graphql.user.edge_owner_to_timeline_media.edges
    for (let i = 0; i < posts.length; i++) {
      const {node} = posts[i]
      const {accessibility_caption} = node
      if (!accessibility_caption?.includes('UPCOMING CONCERT')) continue
      const startTime = accessibility_caption.replace(/.*UPCOMING CONCERT (.*PM).*/, '$1')
      const dtstart = getTime(startTime)
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 1) // Probably less
      // console.log(accessibility_caption, '\n', startTime, dtstart)
      events.events.push({
        summary: 'Concert in the Courtyard',
        location: '149 W 85th St. New York City',
        dtstart,
        dtend,
        description: 'Concert in the Courtyard',
      })
    }

    return events
  }
} as Curator
