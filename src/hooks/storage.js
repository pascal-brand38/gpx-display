// Copyright (c) Pascal Brand
// MIT License

import { getStorage, ref, uploadBytes, uploadString, getBlob } from "firebase/storage";

// Distance between 2 gps points, from
//     https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistanceInKm(p1, p2) {
  return getDistanceFromLatLonInKm(p1.lat, p1.lon, p2.lat, p2.lon)
}

// check https://firebase.google.com/docs/storage/web/download-files?hl=fr
// and https://firebase.google.com/docs/storage/web/handle-errors
async function getFile(userCredential, filename) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);
  return getBlob(storageRef)
}

async function fetchTracks(userCredential, setTracks, setBounds)  {
  const isPause = (point) => ((point.speed===undefined) || (point.speed<5))
  const blob = await getFile(userCredential, 'all.json')
  const r = await blob.text()
  let tracksInternal = JSON.parse(r)

  let tracks = tracksInternal.map(t => {
    return {
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
  })

  // filter tracks
  tracks.forEach(track => {
    track.points.forEach((point, index) => {
      if (index > 0) {
        const prev = track.points[index-1]
        point.speed = getDistanceInKm(prev, point) / ((point.epoch - prev.epoch) / (60*60))
      }
    })
    track.pauses = track.points.filter(point => isPause(point))
    track.points = track.points.filter(point => !isPause(point))

    // console.log(track.points)
  })

  setTracks(tracks)

  let latMin = tracks[0].points[0].lat
  let latMax = latMin
  let lonMin = tracks[0].points[0].lon
  let lonMax = lonMin

  tracks.forEach(track => {
    track.points.forEach(p => {
      latMin = Math.min(latMin, p.lat)
      latMax = Math.max(latMax, p.lat)
      lonMin = Math.min(lonMin, p.lon)
      lonMax = Math.max(lonMax, p.lon)
    })
  })
  // setCenter([(latMin + latMax)/2, (lonMin + lonMax)/2])
  setBounds([[latMin, lonMin], [latMax, lonMax]])

}

export default {
  getFile,
  fetchTracks,
}
