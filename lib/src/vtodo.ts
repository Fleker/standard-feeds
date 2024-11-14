import dateFormat from "./date-format"
import sanitize from "./sanitize"

/**
 * A TODO object as per RFC5545 Section 3.6.2
 * @see https://www.rfc-editor.org/rfc/rfc5545#section-3.6.2
 */
export interface Todo {
  dtstamp: Date
  uid: string
  /** Category, essentially. Could mean Task List or Project Name. */
  class?: string
  /**
   * This property defines the date and time that a to-do was actually completed.
   * @see 3.8.2.1
   */
  completed?: Date
  description?: string
  /** Timestamp */
  dtstart?: Date
  /**
   * This property specifies information related to the global position for the activity specified by a calendar component.
   * @see 3.8.1.6
   */
  geo?: [number, number]
  lastMod?: number
  /**
   * This property defines the intended venue for the activity defined by a calendar component.
   * @see 3.8.1.7
   */
  location?: string
  organizer?: string
  /**
   * This property is used by an assignee or delegatee of a
   * to-do to convey the percent completion of a to-do to the
   * "Organizer".
   * @see 3.8.1.8
   */
  percent?: number
  /**
   * This property defines the relative priority for a calendar component.
   * Scale is 9-0, with 0 being highest.
   * @see 3.8.1.9
   */
  priority?: number
  recurid?: any
  seq?: any
  /**
   * This property defines the overall status or confirmation for the calendar component.
   * Options might be 'NEEDS-ACTION', 'COMPLETED', 'IN-PROCESS', or 'CANCELLED' for VTODO
   * Options might be 'TENTATIVE', 'CONFIRMED', 'CANCELLED' for VEVENT
   * Options might be 'DRAFT', 'FINAL', 'CANCELLED' for VJOURNAL
   * @see 3.8.1.11
   */
  status?: string
  /**
   * This property defines a short summary or subject for the calendar component.
   * @see 3.8.1.12 
   */
  summary?: string
  url?: string
  attach?: any[]
  attendee?: any[]
  categories?: string[]
  comment?: string[]
  contact?: any
  exdate?: any
  rstatus?: any
  related?: any
  /**
   * This property defines the equipment or resources anticipated for an activity specified by a calendar component.
   * Convert to a comma-based string.
   * @see 3.8.1.10
   */
  resources?: string[]
  rdate?: any
  xProp?: any
  ianaProp?: any
}

/**
 * A Curator is a custom object that converts dynamic content
 * into a feed.
 */
export interface TodoCurator {
  /**
   * Performs the process of grabbing site content and converting it to RSS.
   */
  obtainFeed: () => Promise<Todo[]>
}


export const todoToString = (todo: Todo): string => {
  const description = todo.description ? `\nDESCRIPTION:${sanitize(todo.description)}` : ''
  const completed = todo.completed ? `\nCOMPLETED:${dateFormat(todo.completed)}` : ''
  const categories = todo.categories?.length ? `\nCATEGORIES:${todo.categories.join(',')}` : ''
  const url = todo.url ? `\nURL:${todo.url}` : ''
  const status = todo.status ? `\nSTATUS:${todo.status}` : ''
  return `BEGIN:VTODO
DTSTAMP:${dateFormat(todo.dtstamp)}
UID:${todo.uid}
SUMMARY:${todo.summary}
DTSTART:${dateFormat(todo.dtstamp)}${description}${completed}${categories}${url}${status}
END:VTODO`
}