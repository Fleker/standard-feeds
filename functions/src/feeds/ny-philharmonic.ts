/**
 * Curator for https://nyphil.org/calendar?season=all&page=all
 */

const cheerio = require('cheerio')
const spacetime = require('spacetime')
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
      calendarName: 'NY Philharmonic',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default("https://nyphil.org/calendar?season=all&page=all", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ASP.NET_SessionId=ja41n4xjrddfceepnrbbd4fn; SC_ANALYTICS_GLOBAL_COOKIE=a6f73de06ac242e59f3d65bd8e341020|False; _gcl_au=1.1.465415114.1652142889; prevPage1=nyphil.org/calendar?season=all&page=all; prevPageReload=https://nyphil.org/calendar?season=all&page=all; _ga=GA1.2.207433264.1652142889; _gid=GA1.2.904152000.1652142889; _dc_gtm_UA-285871-5=1; _fbp=fb.1.1652142889150.1430195559; QueueITAccepted-SDFrts345E-V3_onsales=EventId%3Donsales%26QueueId%3D00000000-0000-0000-0000-000000000000%26RedirectType%3Ddisabled%26IssueTime%3D1652142889%26Hash%3D66ebcac452eb523fc0d92995da774fd99a3ef2e75b60b07593fcaa3e0d09c1dc; _gali=main; LPVID=E2NjZiYjA1MGE0N2Y2Mzk1; LPSID-55863580=axsq-fBhTeGW3rLmSIHL-Q"
      },
      "method": "GET"
    });
    const body = await res.text()
    const $ = cheerio.load(body)

    const description = 'New York Philaharmonic event'
    const location = 'David Geffen Hall, 10 Lincoln Center Plaza, New York NY 10023-6970'
    const elements = $('div#cal-list').children()
    for (let i = 0; i < elements.length; i++) {
      const el = $(elements[i])
      const eventDateStr = $(el).find('.eventListItem22__date').text().trim().replace(/\n/g, ' ').replace(/\s\s/g, ' ').replace(/\s\w+day/, '')
      const time = $(el).find('span.eventListItem22__heading__time').text().trim().replace(/M.*/s, 'M').replace(/\s([AP]M)/, '$1')
      const url = `https://nyphil.org/${$(el).find('a').attr('href')}`
      const summary = $(el).find('h1').text().trim()
      if (summary === '') continue; // Skip
      const dtstr = `${eventDateStr} ${time}`
      .replace(/\s\s*/g, ' ')
      const dtstart = getTime(dtstr)
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 2) // Assume
      events.events.push({
        summary,
        dtstart,
        dtend,
        description: `${description} ${url}`,
        location,
        url,
      })
    }

    return events
  }
} as Curator
