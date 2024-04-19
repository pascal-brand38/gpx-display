import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
//import fs from 'fs'
import "leaflet/dist/leaflet.css";
import { DateTime } from 'luxon'

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Pascal Brand'


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

function GPXTrace({tracks}) {
  let traces = []
  tracks.forEach((track, index) => {
    traces.push(<Polyline key={index} positions={[track.points]} color={'red'} smoothFactor={2}  />)
    // track.pauses.forEach((pause, i) => {
    //   traces.push(<Marker key={i} position={ pause } ></Marker>)
    // });
  })
  return traces
}

function HighlightTrace({tracks, selectedTrack}) {
  if ((tracks.length > 0) && (selectedTrack < tracks.length)){
    return <Polyline key={tracks.length} positions={[tracks[selectedTrack].points]} color={'blue'} smoothFactor={2} />
  }
}



// https://www.npmjs.com/package/react-files

async function fetchTracks()  {
  const isPause = (point) => ((point.speed===undefined) || (point.speed<5))
  const x = await fetch('./private/all.json')
  const r = await x.text()
  let tracks = JSON.parse(r)

  // filter tracks
  tracks.forEach(track => {
    track.points.forEach(point => point.epoch = DateTime.fromISO(point.time).toSeconds())
    track.points.forEach((point, index) => {
      if (index > 0) {
        const prev = track.points[index-1]
        point.speed = getDistanceInKm(prev, point) / ((point.epoch - prev.epoch) / (60*60))
      }
    })
    track.pauses = track.points.filter(point => isPause(point))
    track.points = track.points.filter(point => !isPause(point))

    console.log(track.points)
  })

  return tracks
}


function App() {
  // https://urfdvw.github.io/react-local-file-system/
  // https://classic.yarnpkg.com/en/package/react-local-file-system
  // https://www.npmjs.com/package/react-local-file-system

  // https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react


  // const str = fs.readFileSync('C:\\Users\\pasca\\Downloads\\activity_allemans_levignac_2ePyKv0W9XA8eFYoEL8tlEXSA01.gpx')
  // console.log(str)

  const [ tracks, setTracks ] = useState([])    // all the tracks. Loaded in useEffect
  const [ center, setCenter ] = useState([48.866667, 2.333333])   // Paris by default
  const [ selectedTrack, setSelectedTrack ] = useState(0)

  useEffect(() => {
    const asyncFunc = async () => {
      const tracks = await fetchTracks()
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
      setCenter([(latMin + latMax)/2, (lonMin + lonMax)/2])
    }

    asyncFunc();
  }, [])

  // from https://stackoverflow.com/questions/64665827/react-leaflet-center-attribute-does-not-change-when-the-center-state-changes
  // to update center

  function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  return (
    <>
      <MapContainer style={{height: "75vh", width: "75vw"}} center={center}  zoom={9} scrollWheelZoom={true}  >
        <ChangeView center={center} zoom={9} />
        <TileLayer
          attribution={attribution}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          // url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          // subdomains={['mt1','mt2','mt3']}

        />

        <GPXTrace tracks={tracks}/>
        <HighlightTrace tracks={tracks} selectedTrack={selectedTrack}/>
      </MapContainer>
    </>
  )

}

export default App
