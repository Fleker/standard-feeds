/**
 * Curator for https://publictheater.org/calendar?month=6/2021&venue=
 */

const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  // console.log(`"${str}"`, spacetimeDate.toLocalDate(), spacetime(str).toLocalDate())
  return new Date(spacetimeDate.toLocalDate())
}

async function getEventsFor(weekQuery: string) {
  const events: any[] = []
  const res = await fetch.default(`https://theshed.org/calendar/month_view?for_date=${weekQuery}`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "if-none-match": "W/\"cac5643616507607f599e67b7432ed57\"",
      "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "visid_incap_2450157=xROrPyI7TKCQGArLoT5PJBkgxWAAAAAAQUIPAAAAAADH9hz+27w1Ca5lusImHZvz; nlbi_2450157=/Izoe+tneA/B6NZXYd1QQwAAAAAUSVuNerWhZBGZSFXAfwv0; incap_ses_1291_2450157=AmHOArD4tFY0phvu2Y3qERkgxWAAAAAAdw9SfOyKC8ec+uCVLxgDZw==; rand_seed=0.4074335407162508; _ga=GA1.2.1695882209.1623531544; _gid=GA1.2.1624027803.1623531544; _gcl_au=1.1.968750203.1623531544; _rdt_uuid=1623531544559.5ff35696-8ca2-4354-9599-f9c2a4971651; __gads=ID=a87939de4138fd11-2200a0d7a67a004c:T=1623531548:RT=1623531548:S=ALNI_MY0-GPN0YjirscCj6bQyrJr-Wne4w; _fbp=fb.1.1623531544711.1191735478; _gat=1; QueueITAccepted-SDFrts345E-V3_shedsafetynet=EventId%3Dshedsafetynet%26QueueId%3D76850ec5-4762-4d95-9b7d-acfb0c063522%26RedirectType%3Dsafetynet%26IssueTime%3D1623532934%26Hash%3Ddbad3d6b56d613a3c9f6ce6db03e1c6791dc85734981e6dd6581692e7e4ca777; _the_shed_session_production=SXZzYWhNZ2Nldm9XVmd2VFVBeUdrM3pZbEo5Z1FadU5CdEpDb0x1eEtnZVBsMGh2ZmNvQVdhSnFNV3RBOWFDTnpRejIwbTViRmI5N2pQREI1ZVZiUW9icGd2RVpDZVo0aElRelo2RHJMblhoREp0eURlQUM1K1Bnam1uRTBUYUlxZEhoSTlZcU1MT0ZzcTFnUUI4eG1SSzRxeHNnUmpCQ2VIWmxDN3VrZGJSeUduYTROakpPamNvVjR4enpqUW10LS1YQXZRcGJxekR3V1o1NkNjdFhTN2lRPT0%3D--022dff4f9eb9ba969d7b3c8d2259cf5aea6445a1; _uetsid=057d3040cbc111ebb34b95c560acb768; _uetvid=057d5740cbc111eba5262b34a72b475e"
    },
    "method": "GET",
  });
  const body = await res.text()
  const $ = cheerio.load(body)

  console.log(body)
  const performances = $('div.month-calendar-item__event-date')
  for (let i = 0; i < performances.length; i++) {
    const perf = performances[i]
    const dateStr = $(perf).find('.month-calendar-week__event-card').attr('data-date')
    const summary = $(perf).find('h2.event__title').text()
    console.log(summary)
    const tagline = $(perf).find('p.event__tagline').text()
    const url = `https://theshed.org${$(perf).find('a.event__link').attr('href')}`
    const location = 'The Shed'
    const description = `${tagline} ${url}`

    const times = $(perf).find('h3.event__date').text().split(',').map((x: string) => x.trim())
    times.forEach((time: string) => {
      const dtstart = getTime(`${dateStr} ${time.replace(/\s([AP])M/, '$1M')}`)
      // console.log(dateStr, time, dtstart.toISOString())
      const dtend = new Date()
      dtend.setTime(dtstart.getTime() + 1000 * 60 * 60) // 1 hr
      events.push({
        summary,
        dtend,
        dtstart,
        description,
        location,
        url,
      })
    })
  }

  return events
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'The Shed',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    let today = spacetime()
    for (let i = 0; i < 4; i++) {
      const format = today.format('{year}-{iso-month}-{date-pad}')
      console.log(format)
      events.events.push(...(await getEventsFor(format)))
      today = today.add(1, 'week')
    }

    return events
  }
} as Curator
