/**
 * Curator for https://serebii.net
 */

import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

// https://woodburynj.portal.civicclerk.com/
// stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf
// https://woodburynj.portal.civicclerk.com/stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const woodbury = await fetch.default('https://woodburynj.api.civicclerk.com/v1/Events?$filter=categoryId+in+(24,26,27)+and+startDateTime+le+2025-03-01T04:00:00.370Z&$orderby=startDateTime+desc,+eventName+desc&$skip=15')
  const wres = await woodbury.json()
  const rows = wres.value

  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.publishedFiles === undefined || row.publishedFiles.length === 0) {
      continue
    }
    const publishedFiles = row.publishedFiles
    const fileId = publishedFiles[publishedFiles.length - 1].fileId
    const link = `https://woodburynj.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=${fileId},plainText=false)`
    const pubDate = new Date(row.eventDate)

    posts.push({
      authors: ['Woodbury Council'],
      guid: `woodbury-${pubDate.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate,
      title: `Woodbury ${row.eventName}`
    })
  }
  return posts
}

const getFeed = (key: string) => {
  return {
    obtainFeed: async () => {
      const rss: RssFeed = {
        entries: [],
        lastBuildDate: new Date(),
        link: 'https://gloucestercounty.substack.com',
        title: 'Mantua Township Government Minutes',
        icon: 'https://mantuatownship.com/wp-content/uploads/2018/02/FINAL_logo.png',
      }
  
      if (key === 'township') {
        const woobury = await parseBoroMinutes()
        rss.entries.push(...woobury)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
