const axios = require('axios')
const Promise = require('bluebird')
const fs = require('fs')
const writeAsync = Promise.promisify(fs.writeFile)

const mkPages = () => ' '.repeat(25).split('').map((e, i) => i + 1)
const getUrl = page => `https://www.cinetrafic.fr/liste-film/7033/${page}/les-meilleures-series`
const getPage = page => axios.get(getUrl(page))

Promise.reduce(
  mkPages(),
  (carry, page) => getPage(page).then(({data}) => [...carry, data]),
  []
)
  .then(JSON.stringify)
  .then(json => writeAsync('pages.json', json))

