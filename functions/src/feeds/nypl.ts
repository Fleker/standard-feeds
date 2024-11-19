/**
 * Curator for https://www.nypl.org/events/calendar
 */

import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'
const cheerio = require('cheerio')
const spacetime = require('spacetime')

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

async function getEvents(page: number) {
  const res = await fetch.default(`https://www.nypl.org/events/calendar?page=${page}`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9",
      "if-none-match": "\"1622164142-1\"",
      "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "visid_incap_5938=VgoZyFc6SMC1hqYVOExdAapCsGAAAAAAQUIPAAAAAAC7U7ltz0dubCaiB1tlW8XH; nlbi_5938=8UBKcD92u2eb7jdd+2L/sAAAAACz6kXGBZ5KEpFAFsUcH6Yu; _omappvp=s7dQ0wd8HYuaVqPLH8DPupMSAhiNgUcKKbXonbwpX7LIKtJJzaulHbvPPfcYvEf4AfvL5Ish2zOM9T6bgb8KR6M6nI5S4kjn; _ga=GA1.2.871048939.1622164137; _gid=GA1.2.111984307.1622164137; optimizelyEndUserId=oeu1622164142454r0.26315267809612686; has_js=1; nyplSeg=offsite; incap_ses_7223_5938=zbxCdAMmC3iccFRcZ0A9ZMM0sWAAAAAATSY1bgB7JnU/ddAS9ZKCRA==; AWSALB=39qkCzb1jcE9tWjONmkgsj9vaUD+vbSMnfb4Bx1kA4Om4yqGBKpODeEEn74birCZgHeOgtuAU6j+RzALm6hqZj8CIXjm/cjAkVS/s8kwpv17LlQigxWS1kXXBvj2; AWSALBCORS=39qkCzb1jcE9tWjONmkgsj9vaUD+vbSMnfb4Bx1kA4Om4yqGBKpODeEEn74birCZgHeOgtuAU6j+RzALm6hqZj8CIXjm/cjAkVS/s8kwpv17LlQigxWS1kXXBvj2; omSeen-c2gyiqip4dtafmk9ewrv=1622226735993"
    },
    "method": "GET",
  });
  const body = await res.text()
  const $ = cheerio.load(body)
  const events = []

  const libEvents = $('tr.col-4')
  for (let i = 0; i < libEvents.length; i++) {
    const event = $(libEvents[i])
    const summary = $(event).children('td.event-title').children('div.event-name').text()
    if (!summary) continue
    const url = $(event).children('td.event-title').children('div.event-name').children('a').attr('href')
    const category = $(event).children('td.event-title').children('div.channel-title').text()
    const location = $(event).children('td.event-location').text().replace(/\n/g, ' ')
    const description = (() => {
      const des = $(event).children('td.event-title').children('div.description').text()
      const signup = $(event).children('td.event-title').children('span.signup-method').text()
      const audience = $(event).children('td.event-audience').text().replace(/\n/g, ' ')
      return `${des} ${signup} ${url} Audience: ${audience}`.replace(/\n/g, ' ')
    })()
    const dtstart = (() => {
      let eventTime = $(event).children('td.event-time').text()
      if (eventTime.includes('Today')) {
        eventTime = eventTime.replace('Today', new Date().toDateString())
      }
      eventTime = eventTime.replace('@', '')
      return getTime(eventTime)
    })()
    const dtend = new Date(dtstart)
    dtend.setHours(dtstart.getHours() + 1) // Assume
    dtend.setMinutes(dtstart.getMinutes() + 30) // Assume
    events.push({
      summary,
      dtend,
      dtstart,
      description,
      categories: [category],
      location,
    })
  }
  return events
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'NYPL Events',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    // Get ~2 weeks
    for (let i = 0; i < 10; i++) {
      events.events.push(...(await getEvents(i)))
    }

    return events
  }
} as Curator
