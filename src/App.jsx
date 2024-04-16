import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
//import fs from 'fs'
import "leaflet/dist/leaflet.css";

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Pascal Brand'



function GPXTrace({tracks}) {
  let traces = []
  tracks.forEach((track, index) => {
    traces.push(<Polyline key={index} positions={[track.points]} color={'red'} smoothFactor={2}  />)
  })
  return traces
}

// https://www.npmjs.com/package/react-files

async function fetchTracks()  {
  const x = await fetch('./private/all.json')
  const r = await x.text()
  let tracks = JSON.parse(r)
  return tracks
}


function App() {
  // https://urfdvw.github.io/react-local-file-system/
  // https://classic.yarnpkg.com/en/package/react-local-file-system
  // https://www.npmjs.com/package/react-local-file-system

  // https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react


  // const str = fs.readFileSync('C:\\Users\\pasca\\Downloads\\activity_allemans_levignac_2ePyKv0W9XA8eFYoEL8tlEXSA01.gpx')
  // console.log(str)

  const [ tracks, setTracks ] = useState([])
  const [ center, setCenter ] = useState([48.866667, 2.333333])

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
        />

        <GPXTrace tracks={tracks}/>
      </MapContainer>
    </>
  )

}

export default App
