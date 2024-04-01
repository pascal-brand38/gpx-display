import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
import "leaflet/dist/leaflet.css";

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Pascal Brand'

const sample = [
  {
    lat: 48.726304979176675,
    lon: -3.9829935637739382,
    ele: 5.3000000000029104
  },
  {
    lat: 48.701559484828174,
    lon: -3.9820210959269011,
    ele: 0
  },
  {
    lat: 48.608899028586556,
    lon: -3.9423607860993721,
    ele: 0
  },
]

function GPXTrace() {
  let result = []
  for (let i=0; i<sample.length-1; i++) {
    result.push(<Polyline key={i} positions={[
      [sample[i].lat, sample[i].lon], [sample[i+1].lat, sample[i+1].lon],
    ]} color={'red'} />)
  }
  return result
}

function App() {
    const mapRef = useRef(null);

  return (
    <>
      <MapContainer style={{height: "75vh", width: "75vw"}} center={[sample[0].lat, sample[0].lon]}  zoom={9} scrollWheelZoom={true}  >
        <TileLayer
          attribution={attribution}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GPXTrace />
      </MapContainer>
    </>
  )

}

export default App
