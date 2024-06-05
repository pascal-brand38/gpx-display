// Copyright (c) Pascal Brand
// MIT License

import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css";

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Pascal Brand'
const url = {
  // https://geoservices.ign.fr/documentation/services/services-deprecies/affichage-wmts/leaflet-et-wmts
  // https://data.geopf.fr/private/wms-r?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities&apikey=ign_scan_ws
  // https://wxs.ign.fr/cartes/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities
  ignPlan: "https://data.geopf.fr/wmts?" +
    "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
    "&STYLE=normal" +
    "&TILEMATRIXSET=PM" +
    "&FORMAT=image/png" +
    "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
    "&TILEMATRIX={z}" +
    "&TILEROW={y}" +
    "&TILECOL={x}",

  ignSat: "https://data.geopf.fr/wmts?" +
    "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
    "&STYLE=normal" +
    "&TILEMATRIXSET=PM" +
    "&FORMAT=image/jpeg" +
    "&LAYER=ORTHOIMAGERY.ORTHOPHOTOS" +
    "&TILEMATRIX={z}" +
    "&TILEROW={y}" +
    "&TILECOL={x}",

  openstreetmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
}

function GPXTrace({ tracks }) {
  let traces = []
  tracks.forEach((track, index) => {
    traces.push(<Polyline key={index} positions={[track.points]} color={'red'} smoothFactor={2} />)
    // track.pauses.forEach((pause, i) => {
    //   traces.push(<Marker key={i} position={ pause } ></Marker>)
    // });
  })
  return traces
}

function HighlightTrace({ tracks, selectedTrack, hoverTrack }) {
  let results = []
  if (tracks.length > 0) {
    if (selectedTrack !== undefined) {
      results.push(<Polyline key={0} positions={[tracks[selectedTrack].points]} color={'blue'} smoothFactor={2} />)
    }
    if ((hoverTrack !== undefined) && (hoverTrack !== selectedTrack)) {
      results.push(<Polyline key={1} positions={[tracks[hoverTrack].points]} color={'green'} smoothFactor={2} />)
    }

    return (
      <div>
        {results}
      </div>
    )
  }
}


function Map({ bounds, tracks, selectedTrack, hoverTrack }) {
  if (bounds === undefined) {
    return
  }

  return (
    <>
      <MapContainer style={{ height: "100%", width: "100%" }} scrollWheelZoom={true} bounds={bounds} >
        <TileLayer
          attribution={attribution}
          url={url.openstreetmap}
        />

        <GPXTrace tracks={tracks} />
        <HighlightTrace tracks={tracks} selectedTrack={selectedTrack} hoverTrack={hoverTrack} />
      </MapContainer>
    </>
  )
}


export { Map }
