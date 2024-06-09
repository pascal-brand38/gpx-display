// https://stackoverflow.com/questions/6159074/given-the-lat-long-coordinates-how-can-we-find-out-the-city-country
// https://download.geonames.org/export/dump/
// https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=XXX&lon=YYY

import storage from "./storage"
import convert from "./convert"

let _geonames = undefined
let _filteredGeonames = undefined

async function getGeonames() {
  if (_geonames === undefined) {
    const newGeonamefile = false  // set to true if a new FR.txt has just been uploaded
    const filteredFilename = 'geonames/FR-filtered.txt'
    const filename = (newGeonamefile ? 'geonames/FR.txt' : filteredFilename)
    console.log(`Reading ${filename}`)
    const blob = await storage.downloadPublicBlob(filename)
    const text = await blob.text()
    const lines = text.split('\n')

    console.log(`Splitting ${filename}`)
    _geonames = []
    lines.forEach(line => {
      const split = line.split('\t')
      if (newGeonamefile) {
        const population = split[14]
        if (population !== '0') {
          _geonames.push([ split[1], split[4], split[5] ])
        }
      } else {
        _geonames.push([ split[0], split[1], split[2] ])
      }
    })
    console.log(`Splitting ${filename} done`)

    if (newGeonamefile) {
      // save filtered geonames
      console.log(`Upload ${filteredFilename}`)
      let text = ''
      _geonames.forEach(geoname => {
        text = text + geoname.join('\t') + '\n'
      })
      storage.uploadPublicString(filteredFilename, text)
      console.log(`Upload ${filteredFilename} done`)
    }
  }
}

function filterGeonames(bounds) {
  const add = 0.1
  _filteredGeonames = _geonames.filter(geoname =>
    (bounds[0][0] - add <= geoname[1]) && (geoname[1] <= bounds[1][0] + add) &&
    (bounds[0][1] - add <= geoname[2]) && (geoname[2] <= bounds[1][1] + add)
  )
}


function getCity(lat, lon, closest) {
  if (closest) {
    let prevDist = undefined
    let prevName = undefined
    _filteredGeonames.forEach(geoname => {
      const l1 = geoname[1]
      const l2 = geoname[2]
      if ((Math.abs(lat-l1)<0.2) && (Math.abs(lon-l2)<0.2)) {
        const dist = convert.getDistanceFromLatLonInKm(lat, lon, l1, l2)
        if ((prevDist === undefined) || (dist<prevDist)) {
          prevDist = dist
          prevName = geoname[0]
        }
      }
    })
    return prevName
  } else {
    let result = undefined
    _filteredGeonames.some(geoname => {
      if (convert.getDistanceFromLatLonInKm(lat, lon, geoname[1], geoname[2]) < 0.8) {
        result = geoname[0]
        return true
      }
      return false
    })
    return result
  }
}

export default {
  getCity,
  getGeonames,
  filterGeonames,
}
