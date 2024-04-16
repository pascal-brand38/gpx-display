import path from 'path'
import fs from 'fs'
import gpxParser from 'gpxparser'

function main() {
  const dir = 'private'
  const tracks = []
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.gpx')) {
      const gpxXml = fs.readFileSync(path.join(dir, file)).toString()
      let gpx = new gpxParser(); //Create gpxParser Object
      gpx.parse(gpxXml); //parse gpx file from string data
      console.log(gpx.tracks[0])
      const gpxTrack = gpx.tracks[0]

      const track = {}
      track.name = gpxTrack.name
      track.points = gpxTrack.points

      tracks.push(track)
    }
  });

  fs.writeFileSync(path.join(dir, 'all.json'), JSON.stringify(tracks))
}

main()
console.log('DONE')
