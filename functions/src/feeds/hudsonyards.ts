/**
 * Curator for https://www.hudsonyardsnewyork.com/see-do/events
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

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'Hudson Yards',
      lastBuildDate: new Date(),
      icon: '',
      link: 'https://www.hudsonyardsnewyork.com/see-do/events',
      defaultTimeZone,
      events: []
    }

    const res = await fetch.default('https://www.hudsonyardsnewyork.com/views/ajax?field_end_date_value=09%2F26%2F2022&field_start_date_value=&field_event_vendor_target_id=All&field_event_category_target_id=All&upcoming_filter_id=All&view_name=calendar_of_events&view_display_id=block_1&view_args=all%2F&view_path=%2Fnode%2F2321&view_base_path=&view_dom_id=80aa80d4ef7135d5206a59f00871cfed6b34f916ef2cac69362d8c908513392d&pager_element=0')
    const body = await res.json()
    const $ = cheerio.load(body[1].data)

    const eventsByDate = $('article.node.node--type-event')
    const location = 'Hudson Yards'
    for (let i = 0; i < eventsByDate.length; i++) {
      const dateblock = $(eventsByDate[i]).find('.dates-and-times').html().trim()
      if (!dateblock || !dateblock.includes('Time')) continue // Skip long-term events

      const title = $(eventsByDate[i]).find('h2').text().trim()
      const [date, time] = dateblock.split('<br>')
      const date2 = date.replace(/Date:/, '').trim()
      const time2 = time.replace(/Time:/, '').replace(/~.*/, '').trim()
      const dtstart = getTime(`${date2} ${time2}`)
      const dtend = new Date(dtstart.getTime())
      // +2h
      dtend.setHours(dtend.getHours() + 2)
      dtend.setMinutes(dtend.getMinutes())

      const href = $(eventsByDate[i]).find('a').attr('href')
      const url = `https://hudsonyardsnewyork.com${href}`
      events.events.push({
        summary: title,
        description: `${url}`,
        location,
        url,
        dtstart,
        dtend,
      })
    }

    return events
  }
} as Curator
