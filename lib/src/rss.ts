/**
 * A representation of an RSS feed, encoded as JSON
 * @see https://en.wikipedia.org/wiki/RSS#Example
 */
 export interface RssFeed {
  title: string
  link: string
  icon: string
  lastBuildDate: Date

  entries: {
    title: string
    content: string
    link: string
    guid: string
    pubDate: Date
    authors: string[]
  }[]
}

/**
 * Options for a curation.
 */
export interface CurationOptions {}

/**
 * A Curator is a custom object that converts dynamic content
 * into an RSS feed.
 */
export interface Curator {
  /**
   * Performs the process of grabbing site content and converting it to RSS.
   */
  obtainFeed: (options?: CurationOptions) => Promise<RssFeed>
}

export const toRss = (feed: RssFeed) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">-->
<rss version="2.0">
<channel>
  <title>${feed.title}</title>
  <url>${feed.icon}</url>
  <icon>${feed.icon}</icon>
  <updated>${feed.lastBuildDate.toISOString()}</updated>
  <id>${feed.link}</id>
  <link type="text/html" href="${feed.link}" rel="alternate"/>

  ${feed.entries.map(item =>
  `<item>
    <title>${item.title}</title>
    <description><![CDATA[${item.content}]]></description>
    <link>${item.link}</link>
    <guid isPermalink="true">${item.link}?${item.guid}</guid>
    <id>${item.link}?${item.guid}</id>
    <updated>${item.pubDate.toISOString()}</updated>
    <published>${item.pubDate.toISOString()}</published>
    <pubDate>${item.pubDate.toUTCString()}</pubDate>
    <author>
      ${item.authors.map(author => `<name>${author}</name>`)}
    </author>
  </item>
  `).join('')}
<!--</feed>-->
</channel>
</rss>
  `
}
