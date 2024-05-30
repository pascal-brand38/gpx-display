import path from 'path'
import fs from 'fs'
import gpxParser from 'gpxparser'
import { DateTime } from 'luxon'

function main() {
  const dir = 'private'
  const tracks = []
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.gpx')) {
      const gpxXml = fs.readFileSync(path.join(dir, file)).toString()
      let gpx = new gpxParser(); //Create gpxParser Object
      gpx.parse(gpxXml); //parse gpx file from string data
      //console.log(gpx.tracks[0])
      const gpxTrack = gpx.tracks[0]

      let track = {
        meta: {
          name: gpxTrack.name,
          startTimeStr: gpxTrack.points[0].time.toISOString(),
          epoch: DateTime.fromISO(gpxTrack.points[0].time.toISOString()).toSeconds(),
        }
      }
      track.points = gpxTrack.points.map(point =>
        [
          point.lat,
          point.lon,
          point.ele,
          DateTime.fromISO(point.time.toISOString()).toSeconds() - track.meta.epoch,
        ]
      )

      tracks.push(track)

      console.log(track.meta.startTimeStr, DateTime.fromISO(track.meta.startTimeStr))
    }
  });

  fs.writeFileSync(path.join(dir, 'all.json'), JSON.stringify(tracks))
}

main()
console.log('DONE')
