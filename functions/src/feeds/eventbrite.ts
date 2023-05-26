/**
 * Curator for Brooklyn Steel (via Bowery Presents)
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

const fetchPage = async (id: string, page: number) => {
  const res = await fetch.default(`https://www.eventbrite.com/org/${id}/showmore/?page_size=30&type=future&page=${page}`)
  const body = await res.json()
  return {
    items: body.data.events,
    hasNextPage: body.data.has_next_page
  }
}

const getEvents = (eventbriteId: string) => {
  return {
    obtainFeed: async () => {
      const events: EventsFeed = {
        calendarName: `eventbrite.com/o/${eventbriteId}`,
        lastBuildDate: new Date(),
        icon: '',
        link: '',
        defaultTimeZone,
        events: []
      }

      const [, id] = eventbriteId.split('-')
      let page = 1
      while (true) {
        const {items, hasNextPage} = await fetchPage(id, page)
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const summary = item.summary
          if (!summary.includes('New York City')) continue;
          const url = item.url
          const price = item.ticket_availability?.minimum_ticket_price?.display
          const location = item.venue?.address?.address?.localized_address_display
          const dtstart = new Date(item.start?.utc)
          const dtend = new Date(item.end?.utc)
          const description = item.description
          events.events.push({
            summary,
            dtend,
            dtstart,
            description: `${description} ${price} ${url}`,
            location,
            url,
          })
        }
        // Flow control
        page++
        if (!hasNextPage) break;
      }

      return events
    }
  } as Curator
}

export default getEvents
