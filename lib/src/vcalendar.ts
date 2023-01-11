import { EventsFeed, eventToString } from "./vevent"
import { Todo, todoToString } from "./vtodo"

interface CalendarEntries {
  events?: EventsFeed
  todo?: Todo[]
}

export const toString = (key: string, collections: CalendarEntries): string => {
  let out = ''
  if (collections.events) {
    out += collections.events.events.map(e => eventToString(e, collections.events!.calendarName)).join('\n') + '\n'
  }
  if(collections.todo) {
    out += collections.todo.map(t => todoToString(t)).join('\n') + '\n'
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:${key}
${out}END:VCALENDAR`
}