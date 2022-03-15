import barclays from '../feeds/barclaycenter'
import { Curator } from '../feeds/ical'
import bric from '../feeds/bric'
import brooklynsteel from '../feeds/brooklynsteel'
import cb7 from '../feeds/cb7'
import cityparks from '../feeds/cityparks'
import columbia from '../feeds/columbia'
import coneyisland from '../feeds/coney-island'
import courtyard from '../feeds/concertsinthecourtyard'
import downtownbrooklyn from '../feeds/downtown-brooklyn'
import foresthills from '../feeds/forest-hill-stadium'
import ihuws from '../feeds/iheart-uws'
import irvingplaza from '../feeds/irvingplaza'
import kgbbar from '../feeds/kgbbar'
import kingstheatre from '../feeds/kingstheatre'
// import lincolncenter from '../feeds/lincolncenter'
import littleisland from '../feeds/littleisland'
import lpr from '../feeds/lpr'
// import marketwatch from '../feeds/marketwatch'
import msg from '../feeds/msg'
import philharmonic from '../feeds/ny-philharmonic'
import publictheater from '../feeds/publictheater'
// import summerhudson from '../feeds/summer-hudson'
import townhall from '../feeds/thetownhall'

const calendarMap: Record<string, Curator> = {
  barclays,
  bric,
  brooklynsteel,
  cb7,
  cityparks,
  columbia,
  coneyisland,
  courtyard,
  downtownbrooklyn,
  foresthills,
  ihuws,
  irvingplaza,
  kgbbar,
  kingstheatre,
  // lincolncenter,
  littleisland,
  lpr,
  // marketwatch,
  msg,
  philharmonic,
  publictheater,
  // summerhudson,
  townhall,
}

describe('Calendar has events', () => {
  jest.setTimeout(1000 * 60) // 1min wait
  for (const [key, curator] of Object.entries(calendarMap)) {
    test(key, async () => {
      const ical = await curator.obtainFeed()
      expect(ical.events.length).toBeGreaterThan(0)
    })
  }
})