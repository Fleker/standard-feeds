import dateFormat from "./date-format"
import sanitize from "./sanitize"

interface Event {
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
}

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
  events: Event[]
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

export const eventToString = (event: Event, calendarName: string): string => {
  const lastModified = new Date()
  const geo = event.geo ? `\nGEO:${event.geo[0]};${event.geo[1]}` : ''
  const location = event.location ? `\nLOCATION:${sanitize(event.location)}` : ''
  const categories = event.categories ? `\nCATEGORIES:${event.categories.join(',')}` : ''
  const organizer = event.organizer ? `\nORGANIZER;CN=${event.organizer.cn}:MAILTO:${event.organizer.mailto}` : ''
  const description = event.description ? `\nDESCRIPTION:${sanitize(event.description)}` : ''
  // const url = event.url ? `\nATTACH:${event.url}` : ''
  const url = event.url ? `\nATTACH;FILENAME=Learn More;FMTTYPE=text/plain:${event.url}` : ''
  return `BEGIN:VEVENT
UID:${calendarName.replace(/\s/g, '-')}-${dateFormat(event.dtstart)}-${event.summary.length}${event.summary.substr(0, 1)}@redsideshiner.cloudfunctions.net
SUMMARY:${sanitize(event.summary)}
LAST-MODIFIED:${dateFormat(lastModified)}
DTSTAMP:${dateFormat(event.dtstart)}
DTSTART:${dateFormat(event.dtstart)}
DTEND:${dateFormat(event.dtend)}${geo}${location}${organizer}${categories}${description}${url}
CLASS:PUBLIC
END:VEVENT`
}
