/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

// https://woodburynj.portal.civicclerk.com/
// stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf
// https://woodburynj.portal.civicclerk.com/stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const woodbury = await fetch.default("https://www.logan-twp.org/wp-admin/admin-ajax.php", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "cf_clearance=X0mnTEJU6j_FYITebnHvP5zzFPdsr1uOzLi2VQZxHIA-1745885573-1.2.1.1-Ed2iFbKON1liOaJyvNmvbptiXwhJAmdqEoiIH4RGNM8GpA8UpA2bimP.ZN9VNoT3gdGZ9qisahrw4CfZPHEL2gyZnbFsQ4OdROPEiLgqzVgvek.MJsE73utG7Do3gaqqhIu3gzs5YbBweX14f6uRBAryNNuY6GrLaksQxwyclNYtYCQhaouJWBM0eIUx7ljc8P8KNNT9C8CRQGTIaG1iFt5DctEc24SBNyNDCXN_r.Ug0zOeQ_hgb4IqOpYc.UBRfPKmeIqu.YB8B4tGTCjrc2mYpn_FyWfcgVPx.cnRah.PILWVEAhW4xp3jNZzNhVm2gHSgc6OL0wHgaR9UArFDhXqCLLfgCdr9sh14AI7f_E",
      "Referer": "https://www.logan-twp.org/minutes-and-agendas-library/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "category_id=76&shortcode_atts%5Bexclude_doc_category%5D=bureau-of-fire%2Cbureau-of-fire%2Cconstruction-code-applications%2Cuniform-construction-code-applications%2Cmunicipal-clerk%2Cplanning-board%2Cpublic-works%2Crecreation-community-events%2Ctax-assessor%2Ctax-collector%2Ctreasurer-and-finance&shortcode_atts%5Bpost_type%5D=dlp_document&shortcode_atts%5Blayout%5D=table&action=dlp_fetch_table&_ajax_nonce=43d112a1a6",
    "method": "POST"
  });
  const wres = await woodbury.json()
  const wresj = wres.html
  const $ = cheerio.load(wresj)

  const rows = $('tr')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const anchor = $(row).find('a')
    if (!anchor) continue
    const title = $(anchor).text()
      .replace(/Minutes\d+/g, '')
      .replace(/Minutes/g, '')
      .replace(/Reorganization/g, '')
      .trim()
    if (title.includes('Agenda')) continue;
    const link = $(anchor).attr('href')
    if (!link) continue
    const pubDate = title

    posts.push({
      authors: ['Clayton Council'],
      guid: `clayton-${pubDate}`,
      link,
      content: `View minutes at ${link}`,
      pubDate: new Date(pubDate),
      title: `Clayton ${title}`
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
        title: 'Clayton Township Government Minutes',
        icon: 'https://www.claytonnj.com/sites/all/themes/custom/sites/claytonnj/vts_claytonnj/logo.png',
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
