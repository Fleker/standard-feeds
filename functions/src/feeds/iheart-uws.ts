/**
 * Curator for ilovetheupperwestside.com articles (manual).
 */
const spacetime = require('spacetime')
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

function getTime(str: string) {
  const spacetimeDate = spacetime(str, defaultTimeZone)
  return new Date(spacetimeDate.toLocalDate())
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'I Love the Upper West Side',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: [
        {
          summary: 'Movie: La Boum (The Party)',
          description: 'Features music by Vladimir Cosma',
          categories: ['movie'],
          location: 'Central Park on 79th Street',
          dtstart: getTime('July 9 8:30pm'),
          dtend: getTime('July 9 10:30pm'),
          url: 'https://ilovetheupperwestside.com/films-on-the-green-2021/'
        },
        {
          summary: 'Movie: Interstella 5555: The 5tory of the 5ecret 5tar 5ystem',
          description: 'Features music by Daft Punk, etc.',
          categories: ['movie'],
          location: 'Washington Square Park',
          dtstart: getTime('July 16 8:30pm'),
          dtend: getTime('July 16 10:30pm'),
          url: 'https://ilovetheupperwestside.com/films-on-the-green-2021/'
        },
        {
          summary: 'Movie: Satin Rouge',
          description: 'Features music by Nawfel El Manaa',
          categories: ['movie'],
          location: 'Seward Park',
          dtstart: getTime('July 23 8:30pm'),
          dtend: getTime('July 23 10:30pm'),
          url: 'https://ilovetheupperwestside.com/films-on-the-green-2021/'
        },
        {
          summary: 'Movie: Black Orpheus',
          description: 'Features music by Antonio Carlos Jobim',
          categories: ['movie'],
          location: 'Riverside Park, Pier I',
          dtstart: getTime('July 30 8:30pm'),
          dtend: getTime('July 30 10:30pm'),
          url: 'https://ilovetheupperwestside.com/films-on-the-green-2021/'
        },
        {
          summary: 'Julliard featuring French Repertoire for Bastille Day',
          dtstart: getTime('July 14 7pm'),
          dtend: getTime('July 14 8:30pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'JP Jofre and his Tango Quintet',
          dtstart: getTime('July 21 7pm'),
          dtend: getTime('July 21 8:30pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Jason Anick Acoustic Gypsy Jazz Trio',
          dtstart: getTime('August 25 7pm'),
          dtend: getTime('August 25 8:30pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Hot Hand Brass and Tap Dancer',
          dtstart: getTime('September 15 7pm'),
          dtend: getTime('September 15 8:30pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Movie: Grease',
          dtstart: getTime('July 7 8pm'),
          dtend: getTime('July 7 10pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Movie: Dirty Dancing',
          dtstart: getTime('August 11 8pm'),
          dtend: getTime('August 11 10pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Movie: Indiana Jones',
          dtstart: getTime('September 27 8pm'),
          dtend: getTime('September 27 10pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Movie: Back to the Future',
          dtstart: getTime('October 6 8pm'),
          dtend: getTime('October 6 10pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Movie: Goonies',
          dtstart: getTime('October 27 8pm'),
          dtend: getTime('October 27 10pm'),
          location: 'Waterline Park',
          url: 'https://ilovetheupperwestside.com/outdoor-concerts-movies-waterline-square-park/',
        },
        {
          summary: 'Amsterdam Eco/Arts Festival',
          dtstart: getTime('September 18 12pm'),
          dtend: getTime('September 18 6:30pm'),
          location: 'Amsterdam Avenue, between 109 & 110th Street',
          url: 'https://ilovetheupperwestside.com/weekend-arts-fest-focused-on-environmental-advocacy/',
        }
      ]
    }

    return events
  }
} as Curator
