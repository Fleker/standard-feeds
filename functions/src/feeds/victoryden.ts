/**
 * Curator for Victory Den events
 * https://victoryden.net/schedule/thisweek
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'Europe/Paris'

function getDate(dow: number) {
  const today = new Date()
  while (today.getDay() > dow) {
    today.setDate(today.getDate() - 1)
  }
  while (today.getDay() < dow) {
    today.setDate(today.getDate() + 1)
  }
  return today
}

async function parseRaid(raid: string) {
  // day, den, type, game, person, reason
  const splits = raid.split('|')
  const den = splits[1]
  const res = await fetch.default(`https://www.serebii.net/swordshield/maxraidbattles/den${den}.shtml`)
  const body = await res.text()
  const $ = cheerio.load(body)
  const pkmn = $('td.pkmn')
  const drops = []
  for (let i = 0; i < pkmn.length; i++) {
    const p = $(pkmn[i]).text().trim()
    if (p) {
      drops.push(p)
    }
  }
  // console.log(drops)
  return {den, drops}
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Victory Den',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://sheets.googleapis.com/v4/spreadsheets/1VxWetrTQAt14u6sGor0ShMfDuhSHC7s06wQUHINv9c8/values/Dens?key=AIzaSyAgm2xzJcVRG3CqQEtINF7Q94QEjN0agGk')
    const body = await res.json()

    for (let i = 1; i < 8; i++) {
      const value = body.values[i]
      const raid1 = await parseRaid(value[1])
      const raid2 = await parseRaid(value[2])
      const dtstart = getDate(i - 1)
      dtstart.setUTCHours(14, 30)
      const dtend = getDate(i - 1)
      if (i === 5 || i === 6) {
        dtend.setUTCHours(25, 0)
      } else {
        dtend.setUTCHours(23, 0)
      }
      const url = 'https://www.twitch.tv/victoryden'

      if (raid1.den) {
        events.events.push({
          summary: `Hosting Den ${raid1.den} raids`,
          dtend,
          dtstart,
          description: `${raid1.drops.join(', ')} ${url}`,
          location: '',
          url,
        })
      }

      if (raid2.den) {
        events.events.push({
          summary: `Hosting Den ${raid2.den} raids`,
          dtend,
          dtstart,
          description: `${raid2.drops.join(', ')} ${url}`,
          location: '',
          url,
        })
      }

      const gmaxRaid = body.values[8]
      const gmaxDetails = gmaxRaid[1].split('|')
      const boss = gmaxDetails[1]
      events.events.push({
        summary: `Hosting GMAX ${boss} raids`,
        dtend,
        dtstart,
        description: `${url}`,
        location: '',
        url,
      })
    }

    return events
  }
} as Curator
 