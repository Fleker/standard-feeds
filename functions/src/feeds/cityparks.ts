/**
 * Curator for https://www.msg.com/calendar/
 */

const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

function pd(str: string) {
  return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'City Parks Foundation',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // https://cityparksfoundation.org/calendar/
    const res = await fetch.default("https://cityparksfoundation.org/wp-admin/admin-ajax.php?action=get_events&date=20210608&filters%5B0%5D%5Bname%5D=Manhattan&filters%5B0%5D%5Bterm%5D=Manhattan&filters%5B0%5D%5Bactive%5D=true&filters%5B0%5D%5Btype%5D=category&days=31&preciseDate=false");
    const body = await res.json()
    const {sections} = body

    for (const section of sections) {
      for (const event of section.events) {
        const {meta, post} = event
        const {post_title, /*post_content*/} = post
        const {categories, locations, link, events_page_start_date, events_page_end_date, events_page_dates, excerpt} = meta

        const summary = post_title
        const url = link
        // const description = `${post_content.replace(/\n/g, ' ')} ${link}`
        const description = `${excerpt.replace(/\n/g, ' ')} ${link}`
        const location = `${locations[0].name} ${locations[0].address}`

        const startDateTime = `${pd(events_page_start_date)} ${events_page_dates[0].events_page_dates_start}`
        const endDateTime = `${pd(events_page_end_date)} ${events_page_dates[0].events_page_dates_end}`
        const dtstart = getTime(startDateTime)
        const dtend = getTime(endDateTime)

        events.events.push({
          summary,
          dtend,
          dtstart,
          description,
          url,
          location,
          categories: categories.map((x: any) => x.name),
        })
      }
    }
    return events
  }
} as Curator
