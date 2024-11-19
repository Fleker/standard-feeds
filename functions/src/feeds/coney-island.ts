/**
 * Curator for https://coneyisland.com/events
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, EventsFeed } from './ical'

const defaultTimeZone = 'America/New_York'

async function getEventsForPage(pageNo: number) {
  return await fetch.default("https://www.coneyisland.com/views/ajax", {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "has_js=1; _ga=GA1.2.868893146.1623342383; _y=f6bf021f-9430-4B0D-96B4-BDA825F87FA5; _shopify_y=f6bf021f-9430-4B0D-96B4-BDA825F87FA5; _gid=GA1.2.1862659005.1631313677; _fbp=fb.1.1631313677212.1208538788; _s=d5c72077-A5A1-4BC9-4B90-DCE1B4B9A2F1; _shopify_s=d5c72077-A5A1-4BC9-4B90-DCE1B4B9A2F1; _gat=1"
    },
    "body": `view_name=clone_of_events&view_display_id=page&view_args=&view_path=events&view_base_path=events&view_dom_id=642e7faabc2bcb46edf4e2e5357fa768&pager_element=0&page=${pageNo}&ajax_html_ids%5B%5D=facebook-jssdk&ajax_html_ids%5B%5D=async-buttons&ajax_html_ids%5B%5D=skip-link&ajax_html_ids%5B%5D=page-wrapper&ajax_html_ids%5B%5D=page&ajax_html_ids%5B%5D=header&ajax_html_ids%5B%5D=logo&ajax_html_ids%5B%5D=name-and-slogan&ajax_html_ids%5B%5D=site-name&ajax_html_ids%5B%5D=site-slogan&ajax_html_ids%5B%5D=main-wrapper&ajax_html_ids%5B%5D=under-header&ajax_html_ids%5B%5D=under-header-content&ajax_html_ids%5B%5D=block-block-16&ajax_html_ids%5B%5D=main&ajax_html_ids%5B%5D=content-top&ajax_html_ids%5B%5D=page-title&ajax_html_ids%5B%5D=content&ajax_html_ids%5B%5D=main-content&ajax_html_ids%5B%5D=block-sharethis-sharethis-block&ajax_html_ids%5B%5D=navigation&ajax_html_ids%5B%5D=main-menu&ajax_html_ids%5B%5D=block-superfish-1&ajax_html_ids%5B%5D=superfish-1&ajax_html_ids%5B%5D=menu-443-1&ajax_html_ids%5B%5D=menu-4499-1&ajax_html_ids%5B%5D=menu-551-1&ajax_html_ids%5B%5D=menu-4498-1&ajax_html_ids%5B%5D=menu-444-1&ajax_html_ids%5B%5D=menu-446-1&ajax_html_ids%5B%5D=menu-4497-1&ajax_html_ids%5B%5D=cal-filter-button&ajax_html_ids%5B%5D=block-block-4&ajax_html_ids%5B%5D=datepicker&ajax_html_ids%5B%5D=block-views-exp-clone-of-events-page&ajax_html_ids%5B%5D=views-exposed-form-clone-of-events-page&ajax_html_ids%5B%5D=edit-program-wrapper&ajax_html_ids%5B%5D=edit-program&ajax_html_ids%5B%5D=edit-category-wrapper&ajax_html_ids%5B%5D=edit-category&ajax_html_ids%5B%5D=edit-submit-clone-of-events&ajax_html_ids%5B%5D=block-block-15&ajax_html_ids%5B%5D=block-multiblock-1&ajax_html_ids%5B%5D=four-blocks-sidebar-wrapper&ajax_html_ids%5B%5D=sharing-sidebar-wrapper&ajax_html_ids%5B%5D=footer-wrapper&ajax_html_ids%5B%5D=block-block-1&ajax_html_ids%5B%5D=block-menu-menu-footer-menu-1&ajax_html_ids%5B%5D=block-menu-menu-footer-menu-2&ajax_html_ids%5B%5D=block-menu-menu-footer-menu-3&ajax_html_ids%5B%5D=ui-datepicker-div&ajax_html_ids%5B%5D=fb-root&ajax_html_ids%5B%5D=stcpDiv&ajax_html_ids%5B%5D=stwrapper&ajax_html_ids%5B%5D=stLframe&ajax_html_ids%5B%5D=stOverlay&ajax_page_state%5Btheme%5D=coneyisland&ajax_page_state%5Btheme_token%5D=gKJ4WCPXMRe7by00tL661OWtMBS0fqP8DzSuWRAyN8c&ajax_page_state%5Bcss%5D%5Bmodules%2Fsystem%2Fsystem.base.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fsystem%2Fsystem.menus.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fsystem%2Fsystem.messages.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fsystem%2Fsystem.theme.css%5D=1&ajax_page_state%5Bcss%5D%5Bmisc%2Fui%2Fjquery.ui.core.css%5D=1&ajax_page_state%5Bcss%5D%5Bmisc%2Fui%2Fjquery.ui.theme.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fsimplenews%2Fsimplenews.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fcalendar%2Fcss%2Fcalendar_multiday.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fcomment%2Fcomment.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fdate%2Fdate_api%2Fdate.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fdate%2Fdate_popup%2Fthemes%2Fdatepicker.1.7.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fdate%2Fdate_repeat_field%2Fdate_repeat_field.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Ffield%2Ftheme%2Ffield.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fnode%2Fnode.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fsearch%2Fsearch.css%5D=1&ajax_page_state%5Bcss%5D%5Bmodules%2Fuser%2Fuser.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fextlink%2Fextlink.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fviews%2Fcss%2Fviews.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fctools%2Fcss%2Fctools.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fmodules%2Fpanels%2Fcss%2Fpanels.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fcss%2Fsuperfish.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fcss%2Fsuperfish-smallscreen.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fcss%2Fsuperfish-vertical.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fstyle%2Fsimple%2Fsimple.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fhtml-reset.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fwireframes.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Flayout-fixed.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Flayout-liquid.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fpage-backgrounds.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Ftabs.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fpages.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fblocks.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fnavigation.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fviews-styles.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fnodes.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fcomments.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fforms.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Ffields.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fconeyisland.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fconeyisland-extra.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fconeyisland-fluid.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fprint.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fie7.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fcss%2Fie6.css%5D=1&ajax_page_state%5Bcss%5D%5Bsites%2Fdefault%2Ffiles%2Ffontyourface%2Ffontsquirrel%2FPusab-fontfacekit%2Fstylesheet.css%5D=1&ajax_page_state%5Bjs%5D%5B0%5D=1&ajax_page_state%5Bjs%5D%5B1%5D=1&ajax_page_state%5Bjs%5D%5B2%5D=1&ajax_page_state%5Bjs%5D%5B3%5D=1&ajax_page_state%5Bjs%5D%5B4%5D=1&ajax_page_state%5Bjs%5D%5B5%5D=1&ajax_page_state%5Bjs%5D%5B6%5D=1&ajax_page_state%5Bjs%5D%5B7%5D=1&ajax_page_state%5Bjs%5D%5B8%5D=1&ajax_page_state%5Bjs%5D%5B9%5D=1&ajax_page_state%5Bjs%5D%5B10%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fjquery_update%2Freplace%2Fjquery%2F1.8%2Fjquery.min.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fjquery-extend-3.4.0.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fjquery-html-prefilter-3.5.0-backport.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fjquery.once.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fdrupal.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fjquery_update%2Freplace%2Fui%2Fui%2Fminified%2Fjquery.ui.core.min.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fjquery_update%2Freplace%2Fui%2Fexternal%2Fjquery.cookie.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fjquery_update%2Freplace%2Fmisc%2Fjquery.form.min.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fajax.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fjquery_update%2Fjs%2Fjquery_update.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fadmin_menu%2Fadmin_devel%2Fadmin_devel.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fextlink%2Fextlink.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fviews%2Fjs%2Fbase.js%5D=1&ajax_page_state%5Bjs%5D%5Bmisc%2Fprogress.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fviews%2Fjs%2Fajax_view.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fctools%2Fjs%2Fauto-submit.js%5D=1&ajax_page_state%5Bjs%5D%5Bhttps%3A%2F%2Fws.sharethis.com%2Fbutton%2Fbuttons.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fgoogle_analytics%2Fgoogleanalytics.js%5D=1&ajax_page_state%5Bjs%5D%5Bhttps%3A%2F%2Fuse.typekit.com%2Fvrs3qur.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fjquery.hoverIntent.minified.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fsfsmallscreen.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fsupposition.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fsuperfish.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Flibraries%2Fsuperfish%2Fsupersubs.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fmodules%2Fsuperfish%2Fsuperfish.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fjs%2Fconey.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fjs%2Fjquery.ui.datepicker.js%5D=1&ajax_page_state%5Bjs%5D%5Bsites%2Fall%2Fthemes%2Fconeyisland%2Fjs%2Fjquery.ui.widget.js%5D=1&ajax_page_state%5Bjquery_version%5D=1.8`,
    "method": "POST",
  });
}

export default {
  obtainFeed: async () => {
    const events: EventsFeed = {
      calendarName: 'NY Philharmonic',
      lastBuildDate: new Date(),
      icon: '',
      link: '',
      defaultTimeZone,
      events: []
    }

    const location = 'Coney Island'
    for (let i = 0; i < 5; i++) {
      const res = await getEventsForPage(i)
      const body = await res.json()
      const $ = cheerio.load(body[2].data)
      const elements = $('div.views-row')
      for (const element of elements) {
        const summary = $(element).find('.views-field-title').text().trim()
        const url = $(element).find('.views-field-title a').attr('href')
        const description = $(element).find('.views-field-body').text().trim()
        const dtstart = new Date($(element).find('.date-display-single').attr('content'))
        const dtend = new Date(dtstart.getTime())
        dtend.setHours(dtend.getHours() + 1)
        events.events.push({
          summary,
          description,
          url,
          dtstart,
          dtend,
          location,
        })
      }
    }

    return events
  }
} as Curator
