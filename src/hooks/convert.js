// Copyright (c) Pascal Brand
// MIT License

// Various formats are available
// - gpx: xml format, saved by GPS applications
//
// - tracks: format used by Map component
//   list of tracks
//   each track is a json
//        {
//          meta: {   // meta data about the track
//            name: "name of the track",
//            startTimeStr: "start time, in ISO format",
//            epoch: "epoch of the start time"
//            gpxFilename: "gpx Filename in firebase storage"
//          },
//          points: [
//            // list of GPS points
//            lat,
//            lon,
//            ele,
//            epoch,
//            speed,
//          ]
//        }
//
// - jsonFormat: used to save in Firebase storage, to minimize the size of the file
//   TODO: DESCRIBE

import gpxParser from 'gpxparser'
import { DateTime } from 'luxon'

// Distance between 2 gps points, from
//     https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const deg2rad = (deg) => deg * (Math.PI/180)

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}


function _getDistanceInKm(p1, p2) {
  return _getDistanceFromLatLonInKm(p1.lat, p1.lon, p2.lat, p2.lon)
}


function gpxToTrack(gpxXmlText, gpxFilename) {
  const isPause = (point) => ((point.speed===undefined) || (point.speed<5))

  let gpx = new gpxParser(); //Create gpxParser Object
  gpx.parse(gpxXmlText); //parse gpx file from string data
  const gpxTrack = gpx.tracks[0]

  let track = {
    meta: {
      name: gpxTrack.name,
      startTimeStr: gpxTrack.points[0].time.toISOString(),
      epoch: DateTime.fromISO(gpxTrack.points[0].time.toISOString()).toSeconds(),
      gpxFilename: gpxFilename,
      distance: undefined,
      startDate: DateTime.fromISO(gpxTrack.points[0].time.toISOString()),
    }
  }

  track.points = gpxTrack.points.map(point => {
    return {
      lat: point.lat,
      lon: point.lon,
      ele: point.ele,
      epoch: DateTime.fromISO(point.time.toISOString()).toSeconds(),
    }
  })

  // filter this track
  track.points.forEach((point, index) => {
    if (index > 0) {
      const prev = track.points[index - 1]
      point.speed = _getDistanceInKm(prev, point) / ((point.epoch - prev.epoch) / (60 * 60))
    }
  })
  track.points = track.points.filter(point => !isPause(point))

  track.meta.distance = 0
  track.points.forEach((point, index) => {
    if (index > 0) {
      const prev = track.points[index - 1]
      track.meta.distance =  track.meta.distance + _getDistanceInKm(prev, point)
    }
  })
  track.meta.distance = Math.round(track.meta.distance * 10) / 10

  return track
}

function jsonFormatToTracks(jsonFormat) {
  const tracks = jsonFormat.map(t => {
    let track = {
      meta: t.meta,
      points: t.points.map(point => {
        return {
          lat: point[0],
          lon: point[1],
          ele: point[2],
          epoch: point[3] + t.meta.epoch,
        }
      }),
    }
    track.meta.startDate = DateTime.fromISO(t.meta.startDate)
    return track
  })
  return tracks
}

function tracksToJsonFormat(tracks) {
  const jsonFormat = tracks.map(t => {
    return {
      meta: t.meta,
      points: t.points.map(point => {
        return [
          point.lat,
          point.lon,
          point.ele,
          point.epoch - t.meta.epoch,
        ]
      }),
    }
  })
  return jsonFormat
}

export default {
  gpxToTrack,
  jsonFormatToTracks,
  tracksToJsonFormat,
}

// TODO: remove duplicate
