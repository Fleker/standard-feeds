/**
 * Curator for https://foresthillsstadium.com/calendar/
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
const spacetime = require('spacetime')

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Forest Hills Stadium',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://aegwebprod.blob.core.windows.net/json/events/58/events.json')
    const body = await res.json()

    /*const fcEvents = $('.c-axs-event-card-listview__wrapper')
    for (let i = 0; i < fcEvents.length; i++) {
      const event = $(fcEvents[i])
      const url = $(event).find('.c-axs-event-card-listview__link').attr('href')
      const title = $(event).find('.c-axs-event-card-listview__title').text()
      const subtitle = $(event).find('.c-axs-event-card-listview__supporting').text()
      const summary = `${title} ${subtitle}`
      const date = $(event).find('.c-axs-event-card-listview__date').text()
      const time = $(event).find('.c-axs-event-card-listview__doors').text().replace('doors:', '')
      const dtstart = getTime(`${date} ${time}`)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 3)

      events.events.push({
        summary,
        dtend,
        dtstart,
        description: '',
        location,
        url,
      })
    }*/

    const fhsEvents = body.events
    for (const event of fhsEvents) {
      const {title, ticketing, bio, venue, eventDateTimeUTC} = event
      const summary = (() => {
        if (title.supporting) {
          return `${title.eventTitleText} ${title.supportingText}`
        }
        return `${title.eventTitleText}`
      })()
      const url = ticketing.eventUrl
      const description = bio
      const location = venue.title
      const dtstart = getTime(eventDateTimeUTC)
      const dtend = new Date(dtstart.getTime())
      dtend.setHours(dtend.getHours() + 3)
      events.events.push({
        summary,
        dtend,
        dtstart,
        description,
        location,
        url,
      })
    }

    return events
  }
} as Curator
