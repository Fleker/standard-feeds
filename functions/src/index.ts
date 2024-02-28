import {RssFeed, toRss} from './feeds/rss'
import * as Rss from './feeds/rss'
import congress from './feeds/congress'
import pokeminers from './feeds/pokeminers'
import serebii from './feeds/serebii'
import glassboro from './feeds/glassboro-govt'

import {Curator, toString} from './feeds/ical'
import angelika from './feeds/angelika'
import arthouse from './feeds/arthouse-hotel'
import barclays from './feeds/barclaycenter'
import bookclubbar from './feeds/bookclubbar'
import bric from './feeds/bric'
import brooklynsteel from './feeds/brooklynsteel'
import carnegiehall from './feeds/carnegiehall'
import caveat from './feeds/caveat'
import cb7 from './feeds/cb7'
import cityparks from './feeds/cityparks'
import columbia from './feeds/columbia'
// import coneyisland from './feeds/coney-island'
// import courtyard from './feeds/concertsinthecourtyard'
import django from './feeds/django'
import downtownbrooklyn from './feeds/downtown-brooklyn'
import elsewhere from './feeds/elsewhere'
import eventbrite from './feeds/eventbrite'
import foresthills from './feeds/forest-hill-stadium'
import freehold from './feeds/freehold'
import friendOfAFriend from './feeds/friend-of-a-friend'
import friendzy from './feeds/friendzy'
import grimmales from './feeds/grimmales'
import hudsonyards from './feeds/hudsonyards'
import ihuws from './feeds/iheart-uws'
import intrepid from './feeds/intrepid'
import irvingplaza from './feeds/irvingplaza'
import kgbbar from './feeds/kgbbar'
import kingstheatre from './feeds/kingstheatre'
import lincolncenter from './feeds/lincolncenter'
import littleisland from './feeds/littleisland'
import livecode from './feeds/livecode-nyc'
import lpr from './feeds/lpr'
import marketwatch from './feeds/marketwatch'
import meetup from './feeds/meetup'
import msg from './feeds/msg'
import musichallwilliamsburg from './feeds/musichallwilliamsburg'
import nyminute from './feeds/nyminute'
// import nypl from './feeds/nypl'
import philharmonic from './feeds/ny-philharmonic'
import pokemonleague from './feeds/pokemonleague'
import publictheater from './feeds/publictheater'
import summerhudson from './feeds/summer-hudson'
import summerstage from './feeds/summerstage'
import sundaesauuce from './feeds/sundaesauuce'
import timeoutmarket from './feeds/timeoutmarket'
import townhall from './feeds/thetownhall'
import triadtheater from './feeds/triad-theater'
import victoryden from './feeds/victoryden'
// import theshed from './feeds/theshed'
import wallacelounge from './feeds/wallacelounge'
import websterhall from './feeds/websterhall'
import wonderville from './feeds/wonderville'

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { TodoCurator } from '../../lib/src/vtodo'
admin.initializeApp()

const spacetime = require('spacetime')

export const rss_serebii = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'application/rss+xml')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  res.send(await toRss(await serebii.obtainFeed()))
})

export const rss_congress = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'application/rss+xml')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  res.send(await toRss(await congress.obtainFeed()))
})

export const rss_pokeminers = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'application/rss+xml')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  res.send(await toRss(await pokeminers.obtainFeed()))
})

export const rss_fetch = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'application/rss+xml')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  const feedsToGrab = (() => {
    const query = (() => {
      if (Array.isArray(req.query.f)) return req.query.f
      return (req.query.f as string).split(',')
    })() as string[]
    return query
  })()
  // https://us-central1-redside-shiner.cloudfunctions.net/rss_fetch?f[]=glassboro&f[]=...
  const feedMap: Record<string, Rss.Curator> = {
    glassboro: glassboro('glassboro'),
    glassboroboe: glassboro('glassboroboe'),
    rowan: glassboro('rowan'),
  }
  const validFeeds = Object.keys(feedMap)
  const validFeedsRead: string[] = []
  const promises: Promise<RssFeed>[] = []

  for (let i = 0; i < validFeeds.length; i++) {
    const validFeed = validFeeds[i]
    if (feedsToGrab.includes(validFeed) || feedsToGrab[0] === 'all') {
      promises.push(feedMap[validFeed].obtainFeed())
      validFeedsRead.push(validFeed)
    }
  }
  const results = await Promise.all(promises)
  const feed: RssFeed = results[0]
  // feed.entries = feed.entries.filter(e => e.pubDate.getFullYear() > 1970)

  if (req.query.json) {
    res.send({
      validFeedsRead,
      feed,
    })
  } else {
    for (const a of feed.entries) {
      console.log(a)
    }
    console.info(feed)
    res.send(toRss(feed))
  }
})

export const ical_fetch = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'text/calendar')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  if (req.query.json) {
    res.setHeader('content-type', 'text/plain')
  }
  // https://us-central1-redside-shiner.cloudfunctions.net/ical_fetch?c[]=all&c[]=lincolncenter
  const calendarsToGrab = (() => {
    const query = (() => {
      if (Array.isArray(req.query.c)) return req.query.c
      return (req.query.c as string).split(',')
    })() as string[]
    // Here we hard-code presets
    if (query[0] === 'nyc-uws') {
      return [
        'lincolncenter', 'publictheater', 'summerhudson', 'courtyard', 'cityparks',
        'ihuws', 'philharmonic', 'cb7',
      ]
    }
    return query
  })()
  const calendarMap: Record<string, Curator> = {
    angelika,
    angularnyc: meetup('angularnyc'),
    arthouse,
    barclays,
    bellhouse: eventbrite('the-bell-house-17899492469'),
    beersdata: meetup('advertising-marketing-analysts'),
    bookclubbar,
    bric,
    brooklynsteel,
    carnegiehall,
    caveat,
    cb7,
    cityparks,
    closer: eventbrite('closer-53511938713'),
    // citywinery,
    columbia,
    // coneyisland,
    // courtyard,
    disconap: eventbrite('disco-nap-49115265943'),
    django,
    downtownbrooklyn,
    elsewhere,
    flutternyc: meetup('flutter-nyc'),
    foresthills,
    freehold,
    friendOfAFriend,
    friendzy,
    gdghoboken: meetup('google-developer-group-gdg-hoboken'),
    gdgnyc: meetup('gdgnyc'),
    gdgcloudnyc: meetup('cloudnyc'),
    grimmales,
    hudsonyards,
    ihuws,
    intrepid,
    irvingplaza,
    kgbbar,
    kingstheatre, 
    lincolncenter,
    littleisland,
    livecode,
    lpr,
    marketwatch,
    msg,
    musichallwilliamsburg,
    mycheekydate: eventbrite('mycheekydate-11281652610'),
    nerdnite: eventbrite('littlefield-18046024060'),
    nyminute,
    // nypl,
    philharmonic,
    pokemonleague,
    publictheater,
    summerhudson,
    summerstage,
    sundaesauuce,
    timeoutmarket,
    townhall,
    triadtheater,
    // theshed,
    ukraineinstitute: eventbrite('ukrainian-institute-of-america-8458592558'),
    victoryden,
    voicenyc: meetup('nyc-voice-assistant-meetup'),
    wallacelounge,
    websterhall,
    wonderville,
  }
  const validCalendars = Object.keys(calendarMap)
  const validCalendarsRead: string[] = []
  const events: any[] = []
  const promises = []

  for (let i = 0; i < validCalendars.length; i++) {
    const validCal = validCalendars[i]
    if (calendarsToGrab.includes(validCal) || calendarsToGrab[0] === 'all') {
      promises.push(calendarMap[validCal].obtainFeed())
      validCalendarsRead.push(validCal)
    }
  }
  const results = await Promise.all(promises)
  const lastMonth = spacetime().minus(1, 'month')
  results.forEach(result => {
    // Only show recent (now - 1mo) events.
    events.push(...result.events.filter(e => e.dtstart > lastMonth.toLocalDate()))
  })

  if (req.query.json) {
    res.send({
      validCalendarsRead,
      events,
    })
  } else {
    res.send(toString('Nick Felker//NONSGML Redside Shiner//EN', {
      events: {
        calendarName: 'Events Calendar',
        icon: '',
        link: '',
        lastBuildDate: new Date(),
        defaultTimeZone: 'America/New_York',
        events,
      }
    }))
  }
})

export const vtodo_fetch = functions.https.onRequest(async (req, res) => {
  res.setHeader('content-type', 'text/calendar')
  if (req.query.debug) {
    res.setHeader('content-type', 'text/plain')
  }
  if (req.query.json) {
    res.setHeader('content-type', 'text/plain')
  }
  // https://us-central1-redside-shiner.cloudfunctions.net/ical_fetch?c[]=all&c[]=lincolncenter
  const todoListsToGrab = (() => {
    const query = (() => {
      if (Array.isArray(req.query.t)) return req.query.t
      return (req.query.t as string).split(',')
    })() as string[]
    return query
  })()
  const todoMap: Record<string, TodoCurator> = {
  }
  const validTodoLists = Object.keys(todoMap)
  const validTodoListsRead: string[] = []
  const todos: any[] = []
  const promises = []

  for (let i = 0; i < validTodoLists.length; i++) {
    const validCal = validTodoLists[i]
    if (todoListsToGrab.includes(validCal) || todoListsToGrab[0] === 'all') {
      promises.push(todoMap[validCal].obtainFeed())
      validTodoListsRead.push(validCal)
    }
  }
  const results = await Promise.all(promises)
  results.forEach(result => {
    todos.push(...result)
  })

  if (req.query.json) {
    res.send({
      validTodoListsRead,
      todos,
    })
  } else {
    res.send(toString('Nick Felker//NONSGML Redside Shiner//EN', {
      todo: todos,
    }))
  }
})
