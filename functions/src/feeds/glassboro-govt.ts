/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';
import apiKey from './key-google-drive'

interface DriveFileList {
  kind: 'drive#fileList'
  incompleteSearch: boolean
  files: {
    kind: 'drive#file'
    mimeType: string
    id: string
    name: string
  }[]
}

async function listFiles(folderId: string): Promise<DriveFileList> {
  const res = await fetch.default(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`)
  const data = await res.json()
  return data
}

function downloadUrl(fileId: string) {
  const dlPrefix = 'https://drive.google.com/uc?export=download&id='
  return `${dlPrefix}${fileId}`
}

async function getMinutesFeed(): Promise<RssArticle[]> {
  // https://drive.google.com/drive/folders/0B-l-QWJCLVkhdW52OHpZWFhLbm8?resourcekey=0-mbjKln7-ZtBHmHijO_ZIPg
  const driveFolders = [
    // Council Minutes 2025
    '1qHXcZHQQDI1tzIkoO0DyINKSK9xCHqZo',
    // Planning Board 2025
    '1BuziV_Qn9X6JiVOFVLHUvouWdKwhLvba',
    // Council Minutes 2025
    '1qHXcZHQQDI1tzIkoO0DyINKSK9xCHqZo',
  ]
  const articles: RssArticle[] = []
  for (const folder of driveFolders) {
    const filesInFolder = await listFiles(folder)
    // console.log(filesInFolder)
    for (const file of filesInFolder.files) {
      // console.log(file.name
        // .replace('PB MINUTES', '')
        // .replace('_001', '')
        // .replace(/(\d)\./g, '$1-')
        // .replace('-pdf', ''))
      const article: RssArticle = {
        authors: ['Borough of Glassboro'],
        link: downloadUrl(file.id),
        title: file.name,
        content: 'Click link to view minutes',
        pubDate: new Date(file.name
          .replace('PB MINUTES', '')
          .replace('_001', '')
          .replace(/(\d)\./g, '$1-')
          .replace('-pdf', '')),
        guid: file.id,
      }
      articles.push(article)
    }
  }

  // const feed: RssFeed = {
  //   entries: articles,
  //   icon: 'https://images.squarespace-cdn.com/content/v1/577196f35016e1776170568d/1476126101553-O3MYV288IPSHSDHGB4CJ/glassboro-logo-green-name.png?format=1500w',
  //   lastBuildDate: new Date(),
  //   link: 'https://drive.google.com/drive/folders/0B-l-QWJCLVkhdW52OHpZWFhLbm8?resourcekey=0-mbjKln7-ZtBHmHijO_ZIPg',
  //   title: 'Glassboro Council Minutes',
  // }
  return articles
}

async function getBoardMinutes(): Promise<RssArticle[]> {
  const boeMinutes = 'https://www.gpsd.us/Page/31'
  const boeFetch = await fetch.default(boeMinutes)
  const boeHtml = await boeFetch.text()
  // console.log(boeHtml)
  const $ = cheerio.load(boeHtml)
  const navs = $('ul.page-navigation')
  const links = $(navs).find('a')

  const articles: RssArticle[] = []
  const actions: Promise<void>[] = []
  for (const link of links) {
    const processLink = async (link) => {
      const annualUrl = $(link).attr('href')!
      // console.log(annualUrl)
      const annualFetch = await fetch.default(`https://www.gpsd.us${annualUrl}`)
      const annualHtml = await annualFetch.text()
      const annual$ = cheerio.load(annualHtml)
      const minutes = annual$('ul.ui-articles li')
      for (const article of minutes) {
        const ahref =  $(article).find('h1 a')
        const title = $(ahref).text().trim()
        const sanitizedTitle = title
          .replace('Reorganization Meeting Minutes -', '')
          .replace('Reorganization Meeting -', '')
          .replace('Public Budget Hearing -', '')
          .replace('Public Minutes -', '')
          .replace('Special Board Meeting -', '')
          .replace('Special Board meeting', '')
          .replace('Reorganization', '')
          .replace('Reorg', '')
          .replace('Public Budget Hearing', '')
          .replace('Public Board Minutes', '')
          .replace('Board Retreat', '')
          .replace('Approved Minutes', '')
          .trim()
        if (!sanitizedTitle) continue
        const url = $(ahref).attr('href')!.replace('../../', 'https://www.gpsd.us/')
        const date = new Date(sanitizedTitle)
        articles.push({
          authors: ['Glassboro Board of Education'],
          content: 'Open the link to view article',
          guid: url,
          link: url,
          pubDate: date,
          title,
        })
      }
    }
    actions.push(processLink(link))
  }
  await Promise.all(actions)
  return articles
}

async function getResolutionsFeed(): Promise<RssArticle[]> {
  const agendas = 'https://sites.rowan.edu/president/board-of-trustees/resolutions.html'
  const agendaRes = await fetch.default(agendas)
  const agendaHtml = await agendaRes.text()
  const resolutions = agendaHtml.split('<div><a href="')
  const articles: RssArticle[] = []
  for (const agenda of resolutions) {
    const quote = agenda.indexOf('"')
    if (quote === -1) { continue; }
    const docPath = agenda.substring(0, quote)
    if (!docPath.endsWith('.pdf')) { continue; }
    const docUrl = `https://sites.rowan.edu/president${docPath.replace('..', '')}`
    // const linkText = agenda.substring(quote + 2, endOfLink)
    console.log(docPath)
    const pathSplit = docPath.split('/')
    const linkText = pathSplit[pathSplit.length - 1]
    const date = new Date(linkText
      .replace('Resolutions', '')
      .replace('&#160;', '')
      .trim())

    const article: RssArticle = {
      authors: ['Rowan Board of Trustees'],
      link: docUrl,
      title: linkText,
      content: 'Click link to view resolutions',
      pubDate: date,
      guid: linkText.replace(/[\s,]/g, '-'),
    }
    articles.push(article)
  }
  return articles
}

const getFeed = (key: string) => {
  return {
    obtainFeed: async () => {
      const rss: RssFeed = {
        entries: [],
        lastBuildDate: new Date(),
        link: 'https://gloucestercounty.substack.com',
        title: 'Glassboro Government Minutes',
        icon: 'https://images.squarespace-cdn.com/content/v1/577196f35016e1776170568d/1476126101553-O3MYV288IPSHSDHGB4CJ/glassboro-logo-green-name.png?format=1500w',
      }
  
      if (key === 'glassboro') {
        const glassboro = await getMinutesFeed()
        rss.entries.push(...glassboro)
      } else if (key === 'glassboroboe') {
        const glassboroboe = await getBoardMinutes()
        rss.title = 'Glassboro Board of Education'
        rss.entries.push(...glassboroboe)
      } else if (key === 'rowan') {
        const rowan = await getResolutionsFeed()
        rss.title = 'Rowan Board of Trsutees'
        rss.entries.push(...rowan)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
