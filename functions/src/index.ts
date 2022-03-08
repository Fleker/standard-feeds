import {toRss} from './feeds/rss'
import congress from './feeds/congress'
import pokeminers from './feeds/pokeminers'
import serebii from './feeds/serebii'

import {Curator, toIcal} from './feeds/ical'
import barclays from './feeds/barclaycenter'
import bric from './feeds/bric'
import brooklynsteel from './feeds/brooklynsteel'
import cb7 from './feeds/cb7'
import cityparks from './feeds/cityparks'
import citywinery from './feeds/citywinery'
import columbia from './feeds/columbia'
import coneyisland from './feeds/coney-island'
import courtyard from './feeds/concertsinthecourtyard'
import downtownbrooklyn from './feeds/downtown-brooklyn'
import foresthills from './feeds/forest-hill-stadium'
import ihuws from './feeds/iheart-uws'
import irvingplaza from './feeds/irvingplaza'
import jazzrooftops from './feeds/jazz-rooftops'
import kgbbar from './feeds/kgbbar'
import lincolncenter from './feeds/lincolncenter'
import littleisland from './feeds/littleisland'
import lpr from './feeds/lpr'
import msg from './feeds/msg'
// import nypl from './feeds/nypl'
import philharmonic from './feeds/ny-philharmonic'
import publictheater from './feeds/publictheater'
import summerhudson from './feeds/summer-hudson'
import townhall from './feeds/thetownhall'
import victoryden from './feeds/victoryden'
// import theshed from './feeds/theshed'

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
  // https://us-central1-redside-shiner.cloudfunctions.net/ical_fetch?c[]=all&c[]=lincolncenter
  const calendarsToGrab = (() => {
    const query = req.query.c as string[]
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
    barclays,
    bric,
    brooklynsteel,
    cb7,
    cityparks,
    citywinery,
    columbia,
    coneyisland,
    courtyard,
    downtownbrooklyn,
    foresthills,
    ihuws,
    irvingplaza,
    jazzrooftops,
    kgbbar,
    lincolncenter,
    littleisland,
    lpr,
    msg,
    // nypl,
    philharmonic,
    publictheater,
    summerhudson,
    townhall,
    // theshed,
    victoryden,
  }
  const validCalendars = Object.keys(calendarMap)
  const events: any[] = []
  const promises = []

  for (let i = 0; i < validCalendars.length; i++) {
    const validCal = validCalendars[i]
    if (calendarsToGrab.includes(validCal) || calendarsToGrab[0] === 'all') {
      promises.push(calendarMap[validCal].obtainFeed())
    }
  }
  const results = await Promise.all(promises)
  const lastMonth = spacetime().minus(1, 'month')
  results.forEach(result => {
    // Only show recent (now - 1mo) events.
    events.push(...result.events.filter(e => e.dtstart > lastMonth.toLocalDate()))
  })

  res.send(await toIcal({
    calendarName: 'Events Calendar',
    icon: '',
    link: '',
    lastBuildDate: new Date(),
    defaultTimeZone: 'America/New_York',
    events,
  }))
})