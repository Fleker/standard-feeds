import {toRss} from './feeds/rss'
import congress from './feeds/congress'
import pokeminers from './feeds/pokeminers'
import serebii from './feeds/serebii'

import {Curator, toString} from './feeds/ical'
import arthouse from './feeds/arthouse-hotel'
import barclays from './feeds/barclaycenter'
import bric from './feeds/bric'
import brooklynsteel from './feeds/brooklynsteel'
import carnegiehall from './feeds/carnegiehall'
import caveat from './feeds/caveat'
import cb7 from './feeds/cb7'
import cityparks from './feeds/cityparks'
import columbia from './feeds/columbia'
// import coneyisland from './feeds/coney-island'
// import courtyard from './feeds/concertsinthecourtyard'
import downtownbrooklyn from './feeds/downtown-brooklyn'
import eventbrite from './feeds/eventbrite'
import foresthills from './feeds/forest-hill-stadium'
import friendOfAFriend from './feeds/friend-of-a-friend'
import friendzy from './feeds/friendzy'
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
// import nypl from './feeds/nypl'
import philharmonic from './feeds/ny-philharmonic'
import pokemonleague from './feeds/pokemonleague'
import publictheater from './feeds/publictheater'
import summerhudson from './feeds/summer-hudson'
import summerstage from './feeds/summerstage'
import townhall from './feeds/thetownhall'
import victoryden from './feeds/victoryden'
// import theshed from './feeds/theshed'
import websterhall from './feeds/websterhall'

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
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
    angularnyc: meetup('angularnyc'),
    arthouse,
    barclays,
    bellhouse: eventbrite('the-bell-house-17899492469'),
    bric,
    brooklynsteel,
    carnegiehall,
    caveat,
    cb7,
    cityparks,
    // citywinery,
    columbia,
    // coneyisland,
    // courtyard,
    downtownbrooklyn,
    flutternyc: meetup('flutter-nyc'),
    foresthills,
    friendOfAFriend,
    friendzy,
    gdghoboken: meetup('google-developer-group-gdg-hoboken'),
    gdgnyc: meetup('gdgnyc'),
    gdgcloudnyc: meetup('cloudnyc'),
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
    nerdnite: eventbrite('littlefield-18046024060'),
    // nypl,
    philharmonic,
    pokemonleague,
    publictheater,
    summerhudson,
    summerstage,
    townhall,
    // theshed,
    victoryden,
    voicenyc: meetup('nyc-voice-assistant-meetup'),
    websterhall,
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
