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
        "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "ASP.NET_SessionId=ehb2hldjosocp2c0fpjlo011; SC_ANALYTICS_GLOBAL_COOKIE=73a98c19c41d422c9bca386c04bc2634|False; _ga=GA1.2.112881980.1624580527; _gid=GA1.2.80021593.1624580527; _gac_UA-6218888-74=1.1624580527.Cj0KCQjw2tCGBhCLARIsABJGmZ5XOhR44AZHVRJqGJ09K1JXWVdWO5jGg-YL4-0AJp1xz0zETIdKdrkaApP7EALw_wcB; _gcl_aw=GCL.1624580527.Cj0KCQjw2tCGBhCLARIsABJGmZ5XOhR44AZHVRJqGJ09K1JXWVdWO5jGg-YL4-0AJp1xz0zETIdKdrkaApP7EALw_wcB; _gcl_dc=GCL.1624580527.Cj0KCQjw2tCGBhCLARIsABJGmZ5XOhR44AZHVRJqGJ09K1JXWVdWO5jGg-YL4-0AJp1xz0zETIdKdrkaApP7EALw_wcB; _gcl_au=1.1.2123566262.1624580527; _fbp=fb.1.1624580527285.1316402101; QueueITAccepted-SDFrts345E-V3_onsales=EventId%3Donsales%26QueueId%3D00000000-0000-0000-0000-000000000000%26RedirectType%3Ddisabled%26IssueTime%3D1624580527%26Hash%3D6a5cffc0793c3f7f5b3db55207181a6e656e38dfb59986db7f8dbd3a2ab9fa05; LPVID=kyZDZhNWYwZDVkNmEyYjlj; LPSID-55863580=VlZm_-bmRnu-GTkCEjrUAQ; _gac_UA-285871-5=1.1624580534.Cj0KCQjw2tCGBhCLARIsABJGmZ5XOhR44AZHVRJqGJ09K1JXWVdWO5jGg-YL4-0AJp1xz0zETIdKdrkaApP7EALw_wcB; prevPage2=nyphil.org/calendar?season=22; prevPage1=nyphil.org/calendar?season=all&page=all; prevPageReload=https://nyphil.org/calendar?season=all&page=all; NYPhilDonationModal=true; _gali=main"
      },
      "method": "GET",
    });
    const body = await res.text()
    const $ = cheerio.load(body)

    let eventDateStr = ''
    const description = 'New York Philaharmonic event'
    const location = 'David Geffen Hall, 10 Lincoln Center Plaza, New York NY 10023-6970'
    const elements = $('div#cal-list').children()
    for (let i = 0; i < elements.length; i++) {
      const el = $(elements[i])
      if (el.hasClass('date-cont')) {
        eventDateStr = el.text().trim().replace(/\n/g, ' ').replace(/\s\s/g, ' ').replace(/\s\w+day/, '')
      } else {
        const eventDetailsEl = $(el).find('.col70')
        const time = $(eventDetailsEl).find('h3').text().trim().replace(/M.*/s, 'M').replace(/\s([AP]M)/, '$1')
        const url = `https://nyphil.org/${$(eventDetailsEl).find('a').attr('href')}`
        const summary = $(eventDetailsEl).find('h2').text().trim()
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
    }

    return events
  }
} as Curator
