export interface RssArticle {
  title: string
  content: string
  link: string
  guid: string
  pubDate: Date
  authors: string[]
}

export interface RssAudio {
  title: string
  description: string
  link: string
  authors: string
  pubDate: Date
  audio: {
    url: string
    bytes: number
    format: string
  }
  guid: string
  /** In seconds */
  itunesDuration: number
  itunesImage: string
  itunesExplicit?: boolean
  itunesAuthor?: string
}

/**
 * A representation of an RSS feed, encoded as JSON
 * @see https://en.wikipedia.org/wiki/RSS#Example
 */
export interface RssFeed {
  title: string
  link: string
  icon: string
  lastBuildDate: Date

  entries: (RssArticle | RssAudio)[]
}

export interface PodcastFeed extends RssFeed {
  author: string
  language?: string
  itunesAuthor?: string
  itunesSubtitle?: string
  itunesOwner?: {
    name: string
    email: string
  }
  itunesExplicit?: boolean
  itunesCategory?: string[]
  itunesImage?: string
  entries: RssAudio[]
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

export const toRss = (feed: RssFeed|PodcastFeed) => {
  const rssSpecs = (() => {
    if ('itunesAuthor' in feed) {
      return `xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"
      xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"`
    }
    return `version="2.0"`
  })()
  const channelData = (() => {
    let data = ''
    if ('author' in feed) {
      data += `<author><![CDATA[${feed.author}]]></author>\n`
      data += `<copyright><![CDATA[${feed.author}]]></copyright>\n`
    }
    if ('language' in feed) {
      data += `<language><![CDATA[${feed.language}]]></language>\n`
    }
    if ('itunesOwner' in feed) {
      data += `<webMaster><![CDATA[${feed.itunesOwner?.email}]]></webMaster>\n`
      data += `<itunes:owner>
    <itunes:name>${feed.itunesOwner?.name}</itunes:name>
    <itunes:email>${feed.itunesOwner?.email}</itunes:email>
  </itunes:owner>\n`
    }
    if ('itunesAuthor' in feed) {
      data += `<itunes:author>${feed.itunesAuthor}</itunes:author>\n`
    }
    if ('itunesSubtitle' in feed) {
      data += `<itunes:subtitle>${feed.itunesSubtitle}</itunes:subtitle>\n`
    }
    if ('itunesImage' in feed) {
      data += `<itunes:image>${feed.itunesImage}</itunes:image>\n`
    }
    data += `<itunes:block>yes</itunes:block>\n`
    data += `<itunes:type>episodic</itunes:type>\n`
    if ('itunesCategory' in feed) {
      feed.itunesCategory?.forEach(cat => {
        data += `<itunes:category>${cat}</itunes:category>\n`
      })
    }
    if ('itunesExplicit' in feed) {
      data += feed.itunesExplicit ? `<itunes:explicit>Yes</itunes:explicit>` :
        '<itunes:explicit>No</itunes:explicit>'
    }
    return data
  })()
  const objToFeed = (item: RssArticle | RssAudio) => {
    if ('audio' in item) {
      // is audio
      return `<item>
    <title><![CDATA[${item.title}]]></title>
    <description><![CDATA[${item.description}]]></description>
    <link>${item.link}</link>
    <guid isPermalink="false">${item.link}?${item.guid}</guid>
    <pubDate>${item.pubDate.toUTCString()}</pubDate>
    <dc:creator>
      <![CDATA[${item.authors}]]>
    </dc:creator>
    <enclosure url="${item.audio.url}" length="${item.audio.bytes}" type="${item.audio.format}"/>
    ${item.itunesAuthor ? `<itunes:author>${item.itunesAuthor}</itunes:author>` : ''}
    ${item.itunesDuration ? `<itunes:duration>${item.itunesDuration}</itunes:duration>` : ''}
    ${item.itunesImage ? `<itunes:image href="${item.itunesImage}"/>` : ''}
    ${item.itunesExplicit ? `<itunes:explicit>Yes</itunes:explicit>` : '<itunes:explicit>No</itunes:explicit>'}
  </item>
  `
    } else {
      // is article
      return `<item>
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
  `
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss ${rssSpecs}>
<channel>
  <title>${feed.title}</title>
  <url>${feed.icon}</url>
  <icon>${feed.icon}</icon>
  <updated>${feed.lastBuildDate.toISOString()}</updated>
  <id>${feed.link}</id>
  <link type="text/html" href="${feed.link}" rel="alternate"/>
  ${channelData}

  ${feed.entries.map(item => objToFeed(item)).join('')}
</channel>
</rss>
  `
}
