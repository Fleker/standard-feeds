/**
 * Curator for https://lincolncenter.org
 */

const cheerio = require('cheerio')
const spacetime = require('spacetime')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  str = str
    .replace(' at', '')
    .replace('(<em>Audio descriptions provided)</em>', '')
    .replace('(<em>ASL accessible performance)</em>', '')
    .replace(' pm', 'pm')
    .replace(' am', 'am')
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

function parseTimes(strs: string[]) {
  const dtstarts: Date[] = []
  strs.forEach(str => {
    dtstarts.push(getTime(str))
  })
  return dtstarts
}

function parseDescription(p1: string, p2?: string, p3?: string) {
  let description = `${p1}${p2}${p3}`
  return description
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Manhattan Little Island',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://littleisland.org/events-in-the-amph/')
    const body = await res.text()
    const $ = cheerio.load(body)

    const eventsByDate = $('p.typography-module--bodyCopy--3H6ET')
    for (let i = 0; i < eventsByDate.length; i++) {
      let p = $(eventsByDate[i])
      while (!$(p).children('strong').children('a').length && i < eventsByDate.length) {
        p = $(eventsByDate[i])
        // console.log($(p).children('strong').children('a').length)
        // console.log($(p).html())
        i++
      }
      if (i >= eventsByDate.length) {
        continue
      }
      const link = $(p).children('strong').children('a')
      const summary = $(link).text()
      // console.log('summary', summary)
      const url = `https://littleisland.org/${$(link).attr('href')}`
      // AAAHHH there's no better way to do this
      // console.log(summary)
      const p1 = $(eventsByDate[i]).html().split('<br>')
      const p2 = $(eventsByDate[i + 1]).html().split('<br>')
      const p3 = $(eventsByDate[i + 2]).html().split('<br>')
      // console.log(p1)
      // console.log(p2)
      // console.log(p3)
      let times: Date[] = [];
      let description: string = url;
      if (getTime(p1[0]).getFullYear() === 1969) {
        if (getTime(p2[0]).getFullYear() === 1969) {
          if (getTime(p3[0]).getFullYear() === 1969) {
            // Exit
            // continue;
          } else {
            description = parseDescription(p1, p2)
            times = parseTimes(p3)
          }
        } else {
          description = parseDescription(p1, p3)
          times = parseTimes(p2)
        }
      } else {
        description = parseDescription(p2, p3)
        times = parseTimes(p1)
      }
      times.forEach(dtstart => {
        const dtend = new Date(dtstart)
        dtend.setHours(dtstart.getHours() + 2) // Assume
        events.events.push({
          summary,
          dtend,
          dtstart,
          description,
          location: 'Little Island',
          url,
        })
      })
    }

    return events
  }
} as Curator
