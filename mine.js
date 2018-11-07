const cheerio = require('cheerio')
const pages = require('./pages')

const extractLinks = ($, links) => {
  const items = []
  for (let i = 0 ; i < links.length ; i++) {
    items.push($(links[i]).text().trim())
  }
  return items
}

const getters = {
  poster: ($, div) => () => 'https://www.cinetrafic.fr' + div.find('#liste_film_tl').find('img')[0].attribs.src
    .replace('medium', 'big')
    .replace(/\?.*/, ''),

  title: ($, div) => () => div.find('.liste_item_titre').find('strong').text()
    .replace(/\s*\(Série\)/, ''),

  directors: ($, div) => () => extractLinks($, div.find('#val_real').find('a')),

  year: ($, div) => () => Number(div.find('.info_film').find('#val_year').text().trim()),

  countries: ($, div) => () => div.find('.info_film').find('#val_country').text().trim().split(',')
    .filter(item => item !== '...'),

  actors: ($, div) => () => extractLinks($, div.find('.info_film_acteur').find('#val_cast').find('a')),

  fans: ($, div) => () => Number(div.find('.info_film_stats').find('a:first-child').text().trim().match(/.*: (\d+)/)[1])

}

const minePage = page => {
  const $ = cheerio.load(page)
  const items = $('#liste_film > div')
  return items.toArray()
    .filter(({ attribs }) => attribs.id && attribs.id.startsWith('liste_film_'))
    .map(item => item.attribs.id)
    .map(id => Object.keys(getters)
      .map(k => ({ k, getter: getters[k]($, $(`#${id}`)) }))
      .reduce((obj, { k, getter }) => ({ ...obj, [k]: getter() }), {})
    )
}

const data = pages.reduce(
  (carry, page) => [...carry, ...minePage(page)], []
)
console.log(data)
console.log( data.reduce((carry, { countries }) => [...carry, ...countries.filter(country => !carry.includes(country))], []) )