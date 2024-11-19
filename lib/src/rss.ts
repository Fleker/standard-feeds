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
  itunesSummary?: string
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

// https://podcasters.apple.com/support/1691-apple-podcasts-categories
export type ITunesSubcategory = 'Books' | 'Design' | 'Fashion &amp; Beauty' | 'Food' | 'Performing Arts' | 'Visual Arts'
  | 'Careers' | 'Entrepreneurship' | 'Investing' | 'Management' | 'Marketing' | 'Non-Profit'
  | 'Comedy Interviews' | 'Improv' | 'Stand-Up'
  | 'Courses' | 'How To' | 'Language Learning' | 'Self-Improvement'
  | 'Comedy Fiction' | 'Drama' | 'Science Fiction'
  | 'Alternative Health' | 'Fitness' | 'Medicine' | 'Mental Health' | 'Nutrition' | 'Sexuality'
  | 'Education for Kids' | 'Parenting' | 'Pets &amp; Animals' | 'Stories for Kids'
  | 'Animation &amp; Manga' | 'Automotive' | 'Aviation' | 'Crafts' | 'Games' | 'Hobbies' | 'Home &amp; Garden' | 'Video Games'
  | 'Music Commentary' | 'Music History' | 'Music Interviews'
  | 'Business News' | 'Daily News' | 'Entertainment News' | 'News Commentary' | 'Politics' | 'Sports News' | 'Tech News'
  | 'Buddhism' | 'Christianity' | 'Hinduism' | 'Islam' | 'Judaism' | 'Religion' | 'Spirituality'
  | 'Astronomy' | 'Chemistry' | 'Earth Sciences' | 'Life Sciences' | 'Mathematics' | 'Natural Sciences' | 'Nature' | 'Physics' | 'Social Sciences'
  | 'Documentary' | 'Personal Journals' | 'Philosophy' | 'Places &amp; Travel' | 'Relationships'
  | 'Baseball' | 'Basketball' | 'Cricket' | 'Fantasy Sports' | 'Football' | 'Golf' | 'Hockey' | 'Rugby' | 'Soccer' | 'Swimming' | 'Tennis' | 'Volleyball' | 'Wilderness' | 'Wrestling'
  | 'After Shows' | 'Film History' | 'Film Interviews' | 'Film Reviews' | 'TV Reviews'

export type ITunesCategory = 'Art' | 'Business' | 'Comedy'
  | 'Education' | 'Fiction' | 'Government' | 'History' | 'Health &amp; Fitness'
  | 'Kids &amp; Family' | 'Leisure' | 'Music' | 'News'
  | 'Religion &amp; Spirituality' | 'Science' | 'Society &amp; Culture' 
  | 'Sports' | 'Technology' | 'True Crime' | 'TV &amp; Film'


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
  itunesCategory?: Partial<Record<ITunesCategory, ITunesSubcategory[]>>
  itunesImage?: string
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
      data += `<itunes:image href="${feed.itunesImage}"/>\n`
    }
    data += `<itunes:block>yes</itunes:block>\n`
    data += `<itunes:type>episodic</itunes:type>\n`
    if ('itunesCategory' in feed) {
      for (const [cat, subcat] of Object.entries(feed.itunesCategory!)) {
        if (!subcat.length) {
          data += `<itunes:category text="${cat}" />`
        } else {
          data += `<itunes:category text="${cat}">`
          subcat.forEach(s => {
            data += `  <itunes:category text="${s}" />`
          })
          data += `</itunes:category>`
          
        }
      }
    }
    if ('itunesExplicit' in feed) {
      data += feed.itunesExplicit ? `<itunes:explicit>Yes</itunes:explicit>` :
        '<itunes:explicit>No</itunes:explicit>'
    }
    return data
  })()
  const objToFeed = (item: RssArticle | RssAudio) => {
    const pubDate = isNaN(item.pubDate.getTime()) ? new Date('January 1, 1970') : item.pubDate
    if ('audio' in item) {
      // is audio
      return `<item>
    <title><![CDATA[${item.title}]]></title>
    <description><![CDATA[${item.description}]]></description>
    <link>${item.link}</link>
    <guid isPermalink="false">${item.guid}</guid>
    <pubDate>${item.pubDate.toUTCString()}</pubDate>
    <dc:creator>
      <![CDATA[${item.authors}]]>
    </dc:creator>
    <enclosure url="${item.audio.url}" length="${item.audio.bytes}" type="${item.audio.format}"/>
    ${item.itunesAuthor ? `<itunes:author>${item.itunesAuthor}</itunes:author>` : ''}
    ${item.itunesSummary ? `<itunes:summary>${item.itunesSummary}</itunes:summary>` : ''}
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
    <updated>${pubDate.toISOString()}</updated>
    <published>${pubDate.toISOString()}</published>
    <pubDate>${pubDate.toUTCString()}</pubDate>
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
