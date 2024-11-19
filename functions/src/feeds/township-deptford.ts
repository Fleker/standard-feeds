/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

/**
 * Deptford's website is very strange in that I need to make this esoteric request
 * in order to get data back. This is only valid for 2024.
 * @see https://www.deptford-nj.org/government/agendas-minutes
 */
async function fetchCouncilMinutes() {
  const res = await fetch.default("https://www.deptford-nj.org/government/agendas-minutes", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      'cookie': 'ASP.NET_SessionId=2znym31tur0q3vwnqhj2tept; _gid=GA1.2.2122616407.1721777461; _ga_HGG0L9HE54=GS1.1.1721777460.1.1.1721777865.0.0.0; _ga=GA1.2.1742040812.1721777460; _gat_gtag_UA_3570931_25=1',
      'dnt': '1',
      'origin': 'https://www.deptford-nj.org',
      "priority": "u=1, i",
      'referer': 'https://www.deptford-nj.org/government/agendas-minutes',
      "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      "x-microsoftajax": "Delta=true",
      "x-requested-with": "XMLHttpRequest"
    },
    // "referrer": "https://www.deptford-nj.org/government/agendas-minutes",
    // "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "FD%24SM=FD%24FD%24APPanel%7CFD%24F_3690&ctl23_ctl00_ContextData=&ctl24_ctl00_ContextData=&ctl25_ctl00_ContextData=&ctl26_ctl00_ContextData=&ctl27_ctl00_ContextData=&ctl28_ctl00_ContextData=&ctl29_ctl00_ContextData=&ctl30_ctl00_ContextData=&ctl31_ctl00_ContextData=&ctl32_ctl00_ContextData=&ctl33_ctl00_ContextData=&ctl34_ctl00_ContextData=&ctl35_ctl00_ContextData=&ctl36_ctl00_ContextData=&ctl37_ctl00_ContextData=&ctl38_ctl00_ContextData=&ctl39_ctl00_ContextData=&ctl40_ctl00_ContextData=&ctl41_ctl00_ContextData=&ctl42_ctl00_ContextData=&ctl43_ctl00_ContextData=&ctl44_ctl00_ContextData=&ctl45_ctl00_ContextData=&ctl46_ctl00_ContextData=&ctl47_ctl00_ContextData=&ctl48_ctl00_ContextData=&ctl49_ctl00_ContextData=&ctl50_ctl00_ContextData=&ctl51_ctl00_ContextData=&ctl52_ctl00_ContextData=&ctl54_ctl00_ContextData=&FD%24F_83=3680&FD%24F_3680=3690&FD%24F_3690=46255&FD2%24F_3688=&FDenviro%24F_9651=&FD3%24F_3692=&FD4%24F_3696=&FD5%24F_3820=&FD6%24F_3690=&FD7%24F_3694=&FD9%24F_3698=&__EVENTTARGET=FD%24F_3690&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=HWLOh5odwyyI7liaX3qbNQrftWEW5X0bkmaPMUcdhjqx3diQWtnxgYhVTzPsWqWTuc1i7xIAcXbv%2FX0vrRaiTd%2FCKUP8TCf2wjkgPzVaYgyCFCjf4w5Yau8%2FMacNKvcz5C%2Bhw%2B95TaW8KyLmLm0OBTL3p%2BqzxWZthq1YmFrPgHGlUE%2FVsT6MdedNhqFJSiixe%2FxoyQGRhVDP6izZIMxfETsPPh6CBajxQ6oHC0tCxpXsBN57Mg0zv%2FTavLt%2FV82VwOQVqW8vB7fiXRzyUD5N%2FIa%2F9qM9Tw%2B6P6iAxEouHLeNj6xtfYpXuei%2FN%2B8KnWNqvDU9fTkRIS0M3n6KDtBkRvxZly5n%2B0OwPhcWyAtV9RmTQbg8rHGfbbET7fWTyWpFMCfno2LtziB3YagoE51UW8L40Ztp0AifkmrOAjO116wQjMmTOWh6zAXTesKWvNtVfYrj%2B4JgZfgjhDphSLhVEzfYp0STtjPT1lXLizZAX3o7nH98gKepDD8HUwXwadkW9udhF30yZBGHqU1tDe9hzth%2FjhUJnkv4atUvilk0ObK9WLnWGjKO%2Fg6w6xmLSKeabKhVmB%2FpR%2F5zVM%2BnneTgw2xedHOnDNSEzGwGvxM%2F8A9pb%2BFPBTaZRJJZnZeAR8lWSNtZjuFAKYn3NMHK5169V3rXhmSGoBHHreByQclAN6O7y0PX%2Fq6pzZ%2BWoTxnfyHpLQdaa1%2BPSW4KlC2%2FWqpSeLMlDnw4D4neWBlE%2FA2QZtYRfy31VR60tGgs9R2la1v%2FtqdUnSU2n6bJuGp6DwFhVxFh2E%2FLVxbpSW7LAECIdUQkj3DKfyfrGdUHZCUgaLQT31F4tMryYT%2B5RMwlHrb8rb0G5dQHw1cdXV3tc6aLegYJfuXdSG8JSiPN%2FI96%2FRGy04qihBYHDBZd%2BvUosYP2DZ20ZhvBXM2sJDoVnpqW%2F5PHJ53fucxPwUvLfVKhXEmH27wZu4h6%2BUdLLo3n6ulfZywtuYa71qzVLmn12R0tKEh%2BA%2Fu102C%2FaBtblwVF9OfMLQnU%2Bv%2F234X7lHwJR5iVaPjeBq20gekEcI%2BrK7TZw%2F1OsRZflcP0mTuwrwiESCd8jNJvmx8iuov%2FY8O0jmD%2BS%2BGLA4HTzzsdKea9I%2BFvCiHD2jAIkAop3NoDeBbNljjFctIGLnS4b2YLSDc0rY%2BZZKE0IOSPjLKJrbKF9MWmRCe%2BbBc%2FnxcjKHLVZzv1NpEwqiw8zMrl9Bq9UhVt6fQDoVK381EOWL6G5wl6AQT1iDAfuvVswse9RWJ3klmhqlJVUVPui3ypvR30%2B5qj6yI8qNX270ZdK2h3TLH5D3y6UkIggHStNl3iD9tYuM%2F6OYylPM%2F9nHRntT33nbA35pS09dKPF4FGsB7Wdbpu4EzF4%2FUjFbKwBzcQrxXZ1BbrORmxa7BBY%2BpI9OmbmQ73SlxS54q9upQ904eHAUl4N3NF9Jr3KZ8u6oXdW%2BC%2B9HgGXCHavK77vG8R2qy72gzC80VQHLdCcvGCTUx1qhj9ubEbgr4KmbsfgAp1y6PMdzS8iWkeaH26omcejgsHa17Qb8fU%2B7umO%2BHhtkFY3t%2Bclr2dJG%2B5InZUgGG41nkzfJu2PQglCPbHEyanfPtqJV%2BMjrR%2BciYCAMk2%2BTH%2Fan2mLMwyk39ZBBpSvl8e8NallEK1DcvCZQyxBBU5GWeNv8LuzLwH1dlMyMl6nTYah7nYASBeVCaJ9IIXDO28pIwOFYghMHVK0vWhmTYNeboedA0KDu7GCZE%2FydcMDv3IhCdih46XwzPHy41VZr00jeurtZglhf9g7euvs2WGiImaHKlWfjsriMA7JaMC1yj9kGGDrfbOzK8ZyvDFAImvDt3%2FfPG7SaWmwbs5sTMMvnRxGbQwwoPU3XxeB99f5RVVNifqPhv3Kvyg4lGFruJXcHWs%2B5VaRDSbaXaS6AMyuxaawYz7M2iBVEyV83zzEajtmQnq1mkZRRALsR2%2F1LKq0qxDh3wwwuWqaWuRahA6Zpett7QmT%2BbDtcLQUOK0R6U4z3C3v8Bwg7Rz4V%2BeAGqXbGhb2y9zh%2BoGUTUcMfOD72K3TmXFC5iPQle5uhOTvvURBzOe3hB%2FiXRGzWeWxS1FxdcnQQUk5v3sMzF63LF82RaNtDR%2F5o%2FJxpnkAYJCeKxRTD6C9w3AX01P%2Fkkb79VaxKTt%2BudfDwIBRF61kMgSuk5kHrI7s9uFD%2F74yWrr5ngD1BJi%2B7WN6kx2h%2FXnBRVzolWzsSoHe87h1U%2BvFiCqz%2FKWI3R32KP0OaBdiYp1%2BdHN0pE54t8pXJHX%2FsaW7HksEFWK7E%2B7wXCy6v6WBddWCubh8ts3fTpGIb2OG1x4yjQ2HWuLzxdLG4hcuZDO1nb4oloAUZb8DIvHMbXxMvC4rqSXcvScq0v8ZCulFEDNNe8Ren%2BdS1iHIsymBx5WV%2BO3WP7d0jG%2Fkxa83Xotx4jBpCSMAPblbllJQUw%2FXPE5LvwZ230xtk05m8XWeQv%2F6iM7SHiIePQ70PzVfpPDs7Lk%2FOEc%2FKolotg1Lz7Ry1tWAIxREzglHEpGhRI8%2F%2Ff24b%2F93KFTYKvRiKaIyghiaobLapB0hin%2BYAJOIrBT6y2W776DL%2BZsnG%2FRv45qhRUyzzmshq5KXFwuIRXMtLirOzKZyh5M%2FTqmT3QuGUCTobj7HaCuuyGwaEPH52BR%2F7x8lyaTePQOUwFOdJXZbAUYwFbUGZw8%2BUU2yed5vSbGcLJS%2FiBoEXMQ%2Bbi8Ug%2FlwAtIFjXV0T%2Bdz69lqLDqg3Hf80Hm4xpthtfaddqTpKcrx0mvYzYRef1pNS%2FDZGeZqmBe8IMy%2BC43UOTTssskS%2Bs96e4JvQ%2BK7Nssi3OLkGPnQkZRPmxSoJeGhGX2DNje56EdFtBGak%2FDHtF5Pj7Pys2fMMyNSaQ0HhcEvQ8%2FBsXeHvTm2G9Tnju6CrV9oPcvCqyXKANDD3JcTZcG3d3ooQB%2FlHsXZX%2Fk%2FXZTNIXlB5LYUzISfUXgJ6WAhAWJFBStI11hIloxaIuzOeZ0cBcujmCAgjOxpZ2GqMkeK4pB7Qd2p3J5r5oXq74BTSsO3GR2L6HqTK7fJzW4i55Lk9uB4mzoNs1ZoZz3QOsNxWBcZceXZofHmnQs3PJH3TUtFC%2BXMDBorQATsX%2FFARdTTtmnATA4BcdNZ9SKXYpBVdbOgVpRHhOMTNCs%2BSMEGuBrKGdt5nJvGU7jK9WNMLhrlEGiG0lYXQB7cRq4ZsCewLTxYcZYB9u0zqAdjhrhUutE%2BBhU%2B8qz9GYqmmd%2FLy3FgosaWsb%2FocrrDZYXjFPuhaHRmgMGcukTj0dpNUCv6kYFhT%2FrlWYyV2gkhKfxVCv5AYcwdSaP6kP6p41FfBK1dO7uEaKd4Di8jmQq5VXMoPytp%2Fp9NFccWh%2FZkHBJ57EfROyXK53%2FwZCQYmDWZQ7YyBnbzO%2F9j9j8se5Jcvz%2B2d2tcEFVouk94j42OGSRbqCyvLAnr%2BE06gHIaJTDdU37tAzU8%2FVNABv6%2F4uh%2FlxBm%2BX42lkOiFOaZlyqBno4FHTVh%2Bg0&__VIEWSTATEGENERATOR=310DFF95&__EVENTVALIDATION=iKixmEOhd1mxVEe34SSO6qVbc8Dka7mGuNDIlqrVsEnV6S24XVDnbXcTQB7IhqqiwfFgKnv0rePAXWtL2%2BW1hYWRGYQiTixbh0qZXDZqy9XsxPcW7z4jXTO8IzBoypF44R2OlyAYi1OFGcbadQ%2F1y3p8wUMIM2ws4nRh9kQdPtSqMHiVnxGzXCDTr97qFFlFUh5Shmo%2BUD79EGNeJtwKjBUyksv3%2BD8yEvxZ1xBnyxBh%2BRRB5j1mI%2FVhm9uawIgL%2FkwQNy%2B%2BZFgDbGon0niwBniX3D%2Fru5n2dY%2BEtqqySYIiGZRk0dGhX06%2F2s6rQ03kVMI7S48vXv6SSEUiyf%2F%2BCp3UrWAUqmvZMYrgWSGtDuFeNmMynLijXtqTVIQ%2Bb0N1M8FYO4D0qBB2M6xme4ZT1SPDcKWNx13beezzvXtPwGFPFs2Ko3%2B65zmjnXgXSebExIx5Rzi1C9Y%2F6%2BhMjsc1bVo4TaxDsjW%2F4VDTvPyj17MX1m4Yc2i2IsW7TPqlwjZznLc0BUrN3RsODREvJbidpzZO4%2FF9EYfehChtORv7Cv3tz8msoKkBgRpD2Gr0YGB%2BT3fyEQ2e0MDGRnw26AHO%2BVucD3n4jR2qLErtk1N2YVrXAzLd%2FKMe3p9O0gLzk74yksMJZJ6jePUoCeEnptJb3Z65JAMMBHU69MJOc4nO%2FLXAtBY17YmOB9pnckqUnjEEICp4QthhIexYGqbGEfBo27B5zxMQc7nn%2FmE59rX9oZjV8IJoOqOQ1aAymkElh3TS3TopEZjgGLcWKuiWrkJR3yS4%2BzlWURrrWLttf20jq6UKs%2B9vxKmL2zZPuAs%2FY00DCYsuTwo5NpW8AEXZs9ayFVeEtPmLa4azPkD%2FWUHGBJ8MMQR5BSauuj7QwgmSY3mzDEseJTsd5kbmqLiD12ImoWYymp212g8PqoD0oDyV5U2Fm5Miya4MBTIIT4IzQ2RG2I0aCjRXq3R6HsDM9%2BIFrcayHLYfd%2F%2FJZ%2FA2pQM8fBCxqYFD2pxAVy71tqcq5cjUzz4wArdQbhCMzUpxsxwlVmE%2B%2FoGePTYv7cNCkaz0pq%2FeHhZIqWkomgaUTgh02j%2F%2FiZCq0ojMEV1YigBf54APaoxYF6MmDXFFKYsy8Z7S3PU3E%2BpNBFKL6fEr5nL7AAxb2IzogWVLB2lCCCyfktZS15fhTMQtilvdHiJ7k5uL6w3Pnn1zo2Gh2ij93jDsyVlAJRuj5%2FiL%2FcDdWwU%2FxZ%2Ba5cndT2PSRKHcIXgNj10p1GCGFiIB%2FUHJh9jmg9j1x9dq3QAGZfGvU0zTFkixGvN4wKugU2QxM1ObdMrEx7RRBY3OhXTbmho%2Bf4%2BkwL4KnE99KB74ml3k5%2BjRAaDKW%2FQuOTwLycO2dW6rL1w3q8n7TET2qVV3Ze7EI%2BFV6bC%2F1ttahD8znM3gIQ1hPil3bY3PEyxS5yv0BHQo77DoyjKhANupXtXj1NL6217KHSYmr%2FN%2FoonjD7BHj5bUbWufhWSmrFK26DUA%2FJd1W4DkGunX%2FdwbuRyWN6z6U0UCMroGDuQqZG2%2FBJZoOseF34T3JI4n4TtWtCQXfUc3gbxKpt19vMt1Ajybt8PKw5sY4i4s6uI9OBI%2FBzJfspr0VDwmT%2FO3Hc6%2F11FPBjQ%2BKPd3h9M%2F37iPhKrOezQYwBB2VY9s5Hq5ermcEv8eys2UR4dQAL2VHj807ZA%2BtQUTlnX3h8YW9X8tGl3OvQveNqNP%2B9Wj0tA8lvcYVo4KFlgRk5EZpXHmM6AUdsw3JtBERB554Et6S0VMpIdlwwt01ImFw6V1MrilvRBGJO08sA3UcWvOr5F2hzmPhiCotPHWhLpuC8ymfhSrIr1XUZa5OOT9ar00Y5F1OXPDxez5mrrB1T5IhLrhmZdDFe3BENZZYcIzHZAdqS%2F3gp7E%2FrL%2F74BXe%2BHEQeGDTStmjESOMQRdB8UzVHqfGieAZmyLEyZzzeH%2BzqUsR0JD3pBDlFM6Cedpt3ODjtmUdVfu1e2WSjh8KGwo0Fmg8sUIyBDW5YApcewRuD3NAU8%2FXe7ImOyZAm9jfOppdMV3fihRrD%2B9mn9wFwE%2FxUjX7prwZf8Cq%2FUErZJ7mITxw5buauwGRH2azXyIzGfMYPcTGB%2Fs1LBGtJmqNYTNJKKTsoBDfWrsaLVobKxQCUqfO1AjmkfmKuH5aMxHtw2yfE%2BAxxu%2BPlJkaMIw9W%2FqPnQaAwQS6SZJLtYascXm7ppJiwpjntQObfPLLG0RGjaWwC%2FbxVE9nOoFhT41tRBHe%2BQoWSFRI0RZymfh4WRZBRFf%2BSTFZh21DG%2BjEHEQwLyk97UfYGefWF52SIJRnhE5zQI9WAiBo%2Fb7uoWxRCfYLF%2FK3%2FqCCrg9WIGe1WJ%2FOWItHzJy9Ki5%2BlMoGNq3sQWgmBdC4i4renIn43MOKA7fBMNdo5tkRpiFVji3izEhr36Sw0PbgXEQr41NRlGDyLmBqNQWoJEB2ckH%2Bnc1YyVX%2FfqXtNhpPSlgWFaICtG1%2F%2Br3h5ccENdfJpaKspwQiKye%2FEox%2Fyx2CfLwPml1hoznnlhOhCgd%2BJsQbrimtdjfh1VWSG0u3ouF%2BDGESl8bqiZkoLKWR9nbsAIq9f6WypT99ryatZQG8vSuWN97%2FLHGr5vwwlkNLS5jAopgGt2GnZLSC%2FiGI%2Fw%2B4Kg25ES42ToIlbwBGuBGbBXqqE5GxXqd%2Fpfo%2Bsq8TFJSGksQXW8yu6sM%2BA6kArVN8IcpVS6RNNDKXOcXJqXRPzEi2aqFs170mqIT2bVBkbbjJkg4HsEeSN2XncUs6vv6m5PvrIrNJZZleWpEItXFIsU8id8l1ZuEkJ0fXbVkD5P3aoz2D5ApOgKGDmqUvjJk9c7lR0V%2FzB72H%2FKutJ9JObWG%2B01wNqWQu8CRgq3qEs33Yyaqua0MBizvtYE16TtrZNdrvEU9ZjVM9wqXPU2ovYO%2BWWKjt3%2FcxpZWhjeFLHvfPyYvWWWid2i4ZY4cvzTODPDJAU86S%2BYza6mEHim8jEgbFLuSJWQ%2ByrzuyVdOlgz%2FyLnWTWsWbR7d%2FeAOZyXAZ%2BpLD%2FEWETFBdptb%2BcytndsqIOA9jZPGI7bx8sLhqqI7FpifEmvbXdAksZ5Lw8WJSlIXNqEZHZRGG%2FIoLqpGYJ0HFjqc%2ByNNjN64K54Ya9nbF%2FC24NAlynS7lr1HIVtFTdNxHesK5MAeybDBuQEEdC0dWHoxOeZEgs3gIHRiF%2Bfaf3APEkWPN%2BCxs5anw%2FcUcsnFKNr9HwW1h6YaIFVUi%2Fo1CLgLitDKfH%2FxFls2FQ20WcBGUqc18yA%2FMkL%2BrydOWGC0bAlTBJPkz3xMCnrsBuH7FpHoRtzatBzeYmKCd%2FgwdQF0yYgECfkcwU10SIil7EIW7T%2Fb2bnEQ0u5XdeP1w%2B2toBe91YaSbtqN%2BOg20TJdoyKjKOLvSbkgRDSikuAIObEU8aGIWFOQ4gm%2BpjvW%2BU7dKVAFBP6%2F2f4XNIOl9bfbqsR0D2fuJOc9N%2BgqqslXtPGUpEAdq7ENttCTCeTFGa%2BEYR60QivIW0ru1tXJ4uZ8JJRvOGWX7sU4Ov75Pz7fEqBUpk8FKELWO5zjW2kRRvLBIkTbI4Ov8cDMRF3yb6ZqUiXEi7LFK9MtG%2Facje6pO46xQpuTD3fZNDHFOpLjE21RCtgiE6i7HmYbrtTRr1wugBLwG7TAm3sIHYVoWBogXFP8GQolWooid%2Bcf7JHBqwKhAM7UnyHBjG%2FTxG9apQlKKaVi5BoVBAuUiQ3nM5A%2Bt8x7dRaiblJ3dUDLtPaKAqhRvJjo6k5i59wMGNb1WrDXwrLd0e%2Fax7UTW4nhKEdzu3krWTExuvpDNk%2B8%2BI%3D&__ASYNCPOST=true&RadAJAXControlID=FD_AP",
    "method": "POST",
    // "mode": "cors",
    // "credentials": "include"
  });
  const text = await res.text()
  // The format of text is:
  // 1|#||4|6176|updatePanel|FD_FD_APPanel|<div id="FD_AP">...
  // console.log(text)
  return text.split('|')[7]
}

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const html = await fetchCouncilMinutes()
  const $ = cheerio.load(html)
  const rows = $('LI a')

  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const link = `https://deptford-nj.org/${$(row).attr('href')}`
    const dateTitle = ($(row).text().split(' '))[0]
    const pubDate = new Date(dateTitle)
    posts.push({
      authors: ['Deptford Township Council'],
      guid: `${pubDate.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate,
      title: `Deptford Council Minutes ${$(row).text()}`
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
        title: 'Deptford Township Government Minutes',
        icon: 'https://www.deptford-nj.org/data/layout/images/logo.png',
      }
  
      if (key === 'township') {
        const township = await parseBoroMinutes()
        rss.entries.push(...township)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
