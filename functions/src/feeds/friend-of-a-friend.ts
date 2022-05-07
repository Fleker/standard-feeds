/**
 * Curator for https://www.msg.com/calendar/
 */

const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'
const url = 'https://www.friendofafriendcollective.com/community'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Friend of a Friend Collective',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default("https://app.squarespacescheduling.com/schedule.php?action=showCalendar&fulldate=1&owner=23123585&template=class", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "PHPSESSID=6dgu6sj7gk39dlntpl3qj2mnei",
        "Referer": "https://app.squarespacescheduling.com/schedule.php?owner=23123585&template=class",
        "Referrer-Policy": "same-origin"
      },
      "body": "type=&calendar=&skip=true&options%5Bqty%5D=1&options%5BnumDays%5D=3&ignoreAppointment=&appointmentType=&calendarID=",
      "method": "POST"
    });
    const body = await res.text()
    const $ = cheerio.load(body)

    const dates = $('tr.class-date-row')
    const spots = $('td.class-signup-container')
    const titles = $('div.class-name')
    const times = $('div.class-time')
    for (let i = 0; i < dates.length; i++) {
      const dowStart = $(dates[i]).text().trim().replace('Next Week', '')
      const spot = $(spots[i]).text().trim()
      const title = $(titles[i]).text().trim()
      const time = $(times[i]).text().trim()
      const dtstart = getTime(`${dowStart} ${time}`)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 2)
      events.events.push({
        summary: `Dinner at ${title}`,
        location: title,
        url,
        dtstart,
        dtend,
        description: spot
      })
    }

    return events
  }
} as Curator
