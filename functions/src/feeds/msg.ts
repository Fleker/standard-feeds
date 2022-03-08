/**
 * Curator for https://www.msg.com/calendar/
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Madison Square Garden',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // const res = await fetch.default("https://api.msg.com/v2.5/events?page=1&view=calendar&status=active,cancelled,postponed", {
    const res = await fetch.default("https://api.msg.com/v2.5/events?page=1&view=calendar&size=100&status=active", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer e0554a52bf12b176ae14a9f85b60fcb2",
        "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "body": undefined,
      "method": "GET",
    });
    const body = await res.json()
    const {results} = body

    for (const result of results) {
      const summary = result.name
      const location = result.venue_info.name
      const dtstart = new Date(result.start_date)
      const description = result.msg_edp_url
      const dtend = new Date(dtstart)
      dtend.setHours(dtstart.getHours() + 2) // Assume

      events.events.push({
        summary,
        dtend,
        dtstart,
        description,
        url: result.msg_edp_url,
        location,
        categories: result.category.map((x: any) => x.name),
      })
    }

    return events
  }
} as Curator
