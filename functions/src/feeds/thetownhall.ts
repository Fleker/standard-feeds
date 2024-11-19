/**
 * Curator for The Town Hall events
 * https://thetownhall.org/upcoming
 */

const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

async function getEventsFor(monthString: string) {
  const res = await fetch.default(`https://thetownhall.org/api/open/GetItemsByMonth?month=${monthString}&collectionId=55ee75fbe4b0b3e65acfe363&crumb=BQKSQDOiGJpkYTE0NzNhOWM5NDZlNzRjYmI2ZDk4OWEzYTk5Nzk2`)
  const json = await res.json()
  const location = 'The Town Hall'
  const events = []
  for (const e of json) {
    const summary = e.title
    const url = `https://thetownhall.org${e.fullUrl}`
    const {thProducer, thSubtitle, thDoors, thPrice} = e.customContent
    const description = `${thProducer} ${thSubtitle}. Doors open ${thDoors}. ${thPrice}. ${url}`
    const dtstart = new Date(e.addedOn)
    const dtend = new Date(dtstart.getTime())
    dtend.setHours(dtend.getHours() + 3)
    events.push({
      summary,
      location,
      url,
      description,
      dtstart,
      dtend,
    })
  }

  return events
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: '(Le) Poisson Rouge',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Generate this month + 2
    let dateUnderTest = spacetime()
    for (let i = 0; i < 3; i++) {
      const format = dateUnderTest.format('{iso-month}-{year}')
      const monthEvents = await getEventsFor(format)
      events.events.push(...monthEvents)
      dateUnderTest = dateUnderTest.add(1, 'month')
    }

    return events
  }
} as Curator
 