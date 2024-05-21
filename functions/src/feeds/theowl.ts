/**
 * Curator for The Owl
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'The Owl Music Parlor',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://theowl.nyc/feed/mfgigcal/')
    const html = await res.text()
    const $ = cheerio.load(html)
    const items = $('item')

    for (let i = 0; i < items.length; i++) {
      const item = $(items[i])
      const summary = $(item).find('title').text()
      const url = $(item).find('link').text()
      let dtstart = new Date()
      let dtend = new Date()
      let description = ''
      for (const j of $(item).children()) {
        if (j.name === 'mfgigcal:event-date') {
          dtstart = new Date($(j).text())
          dtstart.setHours(19, 30)
          dtend = new Date()
          dtend.setTime(dtstart.getTime())
          dtend.setHours(dtstart.getHours() + 3)
        }
        if (j.name === 'mfgigcal:content') {
          description = $(item).find('description').text() + $(j).text()
        }
      }
      events.events.push({
        summary: summary.replace('<![CDATA[', '').replace(']]>', ''),
        description: description.replace(']]>', '').replace(']]>', ''),
        url,
        categories: ['Music'],
        dtstart,
        dtend,
        location: 'The Owl Music Parlor, 497 Rogers Ave, Brooklyn, NY 11225',
      })
    }

    return events
  }
} as Curator
