/**
 * Converts a Date object into a properly formatted iCal format.
 * @example
 * ```
 * "2021-05-23T00:26:51.568Z"
 *      v
 * "20210523T002651568Z"
 * ```
 *
 * @param date Date to be converted.
 */
const dateFormat = (date: Date) => {
  //   LAST-MODIFIED:20210625T505000Z
  //         DTSTAMP:20190828T000000Z
  // LAST-MODIFIED:20210627T062000
  //       DTSTAMP:20200130T020000Z
    return date.toISOString()
      .replace(/-/g, '')
      .replace(/:/g, '')
      .replace(/[.]/g, '')
      .replace('000', '') // Remove ms
}

export default dateFormat
