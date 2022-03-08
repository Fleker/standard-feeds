/**
 * Curator for Marketwatch IPO Calendar
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

interface Ipo {
  url: string
  name: string
  symbol: string
  exchange: string
  priceRange: string
  shares: string
}

function getIPOs(body: any) {
  const ipos: Ipo[] = []
  const rows = body.find('tbody > tr')
  for (let i = 0; i < rows.length; i++) {
    const $ = cheerio.load(rows[i])
    const cols = $(rows[i]).find('td')
    if (!cols) continue
    ipos.push({
      name: $(cols[0]).text(),
      symbol: $(cols[1]).text(),
      exchange: $(cols[2]).text(),
      priceRange: $(cols[3]).text(),
      shares:$( cols[4]).text(),
      url: $(cols[0]).attr('href'),
    })
  }
  return ipos
}

function getMonday() {
  const date = new Date()
  while (date.getDay() < 1) {
    date.setDate(date.getDate() + 1)
  }
  while (date.getDay() > 1) {
    date.setDate(date.getDate() - 1)
  }
  date.setHours(9 + 4)
  date.setMinutes(0)
  date.setSeconds(0)
  return date
}

function getFriday() {
  const date = new Date()
  while (date.getDay() < 5) {
    date.setDate(date.getDate() + 1)
  }
  while (date.getDay() > 5) {
    date.setDate(date.getDate() - 1)
  }
  date.setHours(16 + 4)
  date.setMinutes(0)
  date.setSeconds(0)
  return date
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'IPO Calendar Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.marketwatch.com/tools/ipo-calendar')
    const body = await res.text()
    const $ = cheerio.load(body)

    const upcomingPane = $('div[data-tab-pane="Upcoming Ipos"]')
    const tables = $(upcomingPane).find('div.element table.table--primary')

    const thisWeek = getIPOs($(tables[0]))
    const nextWeek = getIPOs($(tables[1]))

    thisWeek.forEach(ev => {
      events.events.push({
        summary: `${ev.name} IPO: $${ev.symbol}`,
        description: `${ev.shares} at ${ev.priceRange} on the ${ev.exchange} exchange.`,
        dtstart: getMonday(),
        dtend: getFriday(),
      })
    })

    const nwStart = getMonday()
    nwStart.setDate(nwStart.getDate() + 7)
    const nwEnd = getFriday()
    nwEnd.setDate(nwEnd.getDate() + 7)
    nextWeek.forEach(ev => {
      events.events.push({
        summary: `${ev.name} IPO: $${ev.symbol}`,
        description: `${ev.shares} shares at ${ev.priceRange} on the ${ev.exchange} exchange.`,
        dtstart: nwStart,
        dtend: nwEnd,
      })
    })

    return events
  }
} as Curator
