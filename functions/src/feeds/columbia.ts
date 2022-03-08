/**
 * Curator for Columbia University (Public Events)
 * https://events.columbia.edu/cal/main/showEventList.rdo
 */

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
      calendarName: 'Columbia University (Public Events)',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // See Export Options to get URL
    const res = await fetch.default('https://events.columbia.edu/feeder/main/eventsFeed.do?f=y&sort=dtstart.utc:asc&fexpr=(((vpath=%22/public/aliases/Audience/Public%22)))%20and%20(categories.href=%22/public/.bedework/categories/org/UniversityEvents%22)%20and%20(entity_type=%22event%22%7Centity_type=%22todo%22)&skinName=list-json&count=200')
    const body = await res.json()
    const {bwEventList} = body
    for (const event of bwEventList.events) {
      const {summary, eventlink, start, end, location, contact} = event
      const description = `${event.description} -- Contact ${contact.name} (${contact.email}).`
      events.events.push({
        summary,
        description,
        location: location.address,
        url: eventlink,
        dtstart: getTime(`${start.longdate} ${start.time}`),
        dtend: getTime(`${end.longdate} ${end.time}`),
      })
    }

    return events
  }
} as Curator
