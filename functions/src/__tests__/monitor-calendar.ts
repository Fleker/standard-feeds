import arthouse from './feeds/arthouse-hotel'
import barclays from '../feeds/barclaycenter'
import { Curator } from '../feeds/ical'
import bric from '../feeds/bric'
import brooklynsteel from '../feeds/brooklynsteel'
import carnegiehall from '../feeds/carnegiehall'
import caveat from '../feeds/caveat'
import cb7 from '../feeds/cb7'
import cityparks from '../feeds/cityparks'
import columbia from '../feeds/columbia'
import coneyisland from '../feeds/coney-island'
import courtyard from '../feeds/concertsinthecourtyard'
import downtownbrooklyn from '../feeds/downtown-brooklyn'
import foresthills from '../feeds/forest-hill-stadium'
import friendOfAFriend from '../feeds/friend-of-a-friend'
import friendzy from '../feeds/friendzy'
import ihuws from '../feeds/iheart-uws'
import intrepid from '../feeds/intrepid'
import irvingplaza from '../feeds/irvingplaza'
import kgbbar from '../feeds/kgbbar'
import kingstheatre from '../feeds/kingstheatre'
// import lincolncenter from '../feeds/lincolncenter'
// import littleisland from '../feeds/littleisland'
import livecode from '../feeds/livecode-nyc'
import lpr from '../feeds/lpr'
import marketwatch from '../feeds/marketwatch'
import msg from '../feeds/msg'
import musichallwilliamsburg from '../feeds/musichallwilliamsburg'
import philharmonic from '../feeds/ny-philharmonic'
import publictheater from '../feeds/publictheater'
import summerhudson from '../feeds/summer-hudson'
import summerstage from '../feeds/summerstage'
import townhall from '../feeds/thetownhall'

const calendarMap: Record<string, Curator> = {
  arthouse,
  barclays,
  bric,
  brooklynsteel,
  carnegiehall,
  caveat,
  cb7,
  cityparks,
  columbia,
  coneyisland,
  courtyard,
  downtownbrooklyn,
  foresthills,
  friendOfAFriend,
  friendzy,
  ihuws,
  intrepid,
  irvingplaza,
  kgbbar,
  kingstheatre,
  // lincolncenter,
  // littleisland,
  livecode,
  lpr,
  marketwatch,
  msg,
  musichallwilliamsburg,
  philharmonic,
  publictheater,
  summerhudson,
  summerstage,
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