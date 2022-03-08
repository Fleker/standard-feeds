/**
 * A representation of a feed of calendar events, encoded as JSON
 * @see https://en.wikipedia.org/wiki/ICalendar
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */
export interface EventsFeed {
  calendarName: string
  link: string
  icon: string
  lastBuildDate: Date
  defaultTimeZone: string,

  events: {
    dtstart: Date
    dtend: Date
    summary: string
    geo?: number[]
    location?: string
    organizer?: {
      cn: string
      mailto: string
    }
    url?: string
    categories?: string[]
    description?: string
  }[]
}

/**
 * Options for a curation.
 */
export interface CurationOptions {}

/**
 * A Curator is a custom object that converts dynamic content
 * into an iCal feed.
 */
export interface Curator {
  /**
   * Performs the process of grabbing site content and converting it to iCal.
   */
  obtainFeed: (options?: CurationOptions) => Promise<EventsFeed>
}


/**
 * Converts a Date object into a properly formatted iCal format.
 * @example
 * ```
 * "2021-05-23T00:26:51.568Z"
 *      v
 * "20210523T002651568Z"
 * ```
 *
 * @param date Date to be converted.
 */
const dateFormat = (date: Date) => {
//   LAST-MODIFIED:20210625T505000Z
//         DTSTAMP:20190828T000000Z
// LAST-MODIFIED:20210627T062000
//       DTSTAMP:20200130T020000Z
  return date.toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .replace(/[.]/g, '')
    .replace('000', '') // Remove ms
}

const sanitize = (str: string) => {
  return str.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, ' ')
}

export const toIcal = (feed: EventsFeed) => {
  const lastModified = new Date()
  lastModified.setMilliseconds(0)
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nick Felker//NONSGML Redside Shiner//EN
${feed.events.map(event => {
  const geo = event.geo ? `\nGEO:${event.geo[0]};${event.geo[1]}` : ''
  const location = event.location ? `\nLOCATION:${sanitize(event.location)}` : ''
  const categories = event.categories ? `\nCATEGORIES:${event.categories.join(',')}` : ''
  const organizer = event.organizer ? `\nORGANIZER;CN=${event.organizer.cn}:MAILTO:${event.organizer.mailto}` : ''
  const description = event.description ? `\nDESCRIPTION:${sanitize(event.description)}` : ''
  // const url = ''
  // const url = event.url ? `\nATTACH:${event.url}` : ''
  const url = event.url ? `\nATTACH;FILENAME=Learn More;FMTTYPE=text/plain:${event.url}` : ''
return `BEGIN:VEVENT
UID:${feed.calendarName.replace(/\s/g, '-')}-${dateFormat(event.dtstart)}-${event.summary.length}${event.summary.substr(0, 1)}@redsideshiner.cloudfunctions.net
SUMMARY:${sanitize(event.summary)}
LAST-MODIFIED:${dateFormat(lastModified)}
DTSTAMP:${dateFormat(event.dtstart)}
DTSTART:${dateFormat(event.dtstart)}
DTEND:${dateFormat(event.dtend)}${geo}${location}${organizer}${categories}${description}${url}
CLASS:PUBLIC
END:VEVENT
`}).join('')}END:VCALENDAR
`
}
