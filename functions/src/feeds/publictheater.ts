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
  return new Date(spacetimeDate.toLocalDate())
}

async function getEventsFor(monthQuery: string) {
  const events: any = []
  const res = await fetch.default(`https://publictheater.org/calendar?month=${monthQuery}&venue=`)
  const body = await res.text()
  const $ = cheerio.load(body)

  const performances = $('a.perftime')
  for (let i = 0; i < performances.length; i++) {
    const summary = $(performances[i]).attr('data-title')
    let description = $(performances[i]).attr('data-instructions')
    let url;
    if ($(performances[i]).attr('href')) {
      url = `https://publictheater.org${$(performances[i]).attr('href')}`
      description += url
    }
    if ($(performances[i]).hasClass('notavailable')) {
      description = $(performances[i]).attr('data-sold-out-message')
    }
    const eventDate = $(performances[i]).attr('data-date')
    // see https://github.com/spencermountain/spacetime/issues/291
    const eventTime = $(performances[i]).attr('data-time').replace(' PM', 'PM')
    const dtstart = getTime(`${eventDate} ${eventTime}`)
    const dtend = new Date(dtstart)
    dtend.setHours(dtstart.getHours() + 2) // Assume
    const location = $(performances[i]).attr('data-venue')
    events.push({
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

async function getShakespearePark() {
  // Need to update annually
  // https://publictheater.org/productions/season/2021/sitp/merry-wives/
  const events: any[] = []
  const res = await fetch.default(`https://publictheater.org/productions/season/2021/sitp/merry-wives`)
  const body = await res.text()
  const $ = cheerio.load(body)

  const performances = $('a.has-link')
  for (let i = 0; i < performances.length; i++) {
    const summary = $(performances[i]).attr('data-title')
    let description = $(performances[i]).attr('data-instructions')
    let url
    if ($(performances[i]).attr('href')) {
      url = `https://publictheater.org${$(performances[i]).attr('href')}`
      description += url
    }
    if ($(performances[i]).hasClass('notAvailable')) {
      description = $(performances[i]).attr('data-sold-out-message')
    }
    const eventDate = $(performances[i]).attr('data-date')
    const eventTime = $(performances[i]).attr('data-time')
    const dtstart = getTime(`${eventDate} ${eventTime}`)
    const dtend = new Date(dtstart)
    dtend.setHours(dtstart.getHours() + 2) // Assume
    const location = $(performances[i]).attr('data-venue')

    events.push({
      summary,
      dtend,
      dtstart,
      description,
      location,
    })
  }

  return events
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'NYC Public Theater',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const today = new Date()
    const monthQuery = `${today.getMonth() + 1}/${today.getFullYear()}`
    events.events.push(...(await getEventsFor(monthQuery)))
    if (today.getMonth() < 11) {
      const nextMonthQuery = `${today.getMonth() + 2}/${today.getFullYear()}`
      events.events.push(...(await getEventsFor(nextMonthQuery)))
    } else {
      const nextMonthQuery = `1/${today.getFullYear() + 2}`
      events.events.push(...(await getEventsFor(nextMonthQuery)))
    }

    events.events.push(...(await getShakespearePark()))

    // Deduplicate
    const eventSet = new Set()
    events.events = events.events.filter(ev => {
      if (eventSet.has(ev.dtstart.toISOString())) return false
      eventSet.add(ev.dtstart.toISOString())
      return true
    })

    return events
  }
} as Curator
