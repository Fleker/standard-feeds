import { Curator } from '../feeds/rss'
import congress from '../feeds/congress'
import serebii from '../feeds/serebii'

const rssMap: Record<string, Curator> = {
  congress,
  serebii,
}

describe('RSS feed has posts', () => {
  jest.setTimeout(1000 * 60) // 1min wait
  for (const [key, curator] of Object.entries(rssMap)) {
    test(key, async () => {
      const rss = await curator.obtainFeed()
      expect(rss.entries.length).toBeGreaterThan(0)
    })
  }
})