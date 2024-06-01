// Copyright (c) Pascal Brand
// MIT License

import { useState, useRef, useEffect } from 'react'
import './App.css'
import { initializeApp } from "firebase/app";

import { Menu } from './components/Menu';
import { Description } from './components/Description';
import { Map } from './components/Map';
import { List } from './components/List';



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




async function fetchTracks()  {
  const isPause = (point) => ((point.speed===undefined) || (point.speed<5))
  const x = await fetch('./private/all.json')
  const r = await x.text()
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

  return tracks
}


function App() {
  // https://urfdvw.github.io/react-local-file-system/
  // https://classic.yarnpkg.com/en/package/react-local-file-system
  // https://www.npmjs.com/package/react-local-file-system

  // https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react


  // const str = fs.readFileSync('C:\\Users\\pasca\\Downloads\\activity_allemans_levignac_2ePyKv0W9XA8eFYoEL8tlEXSA01.gpx')
  // console.log(str)
  const [app, setApp] = useState(undefined)
  const [ tracks, setTracks ] = useState([])    // all the tracks. Loaded in useEffect
  const [ bounds, setBounds ] = useState(undefined)
  const [ selectedTrack, setSelectedTrack ] = useState(0)
  const [ hoverTrack, setHoverTrack ] = useState(0)

  useEffect(() => {
    const getTracks = async () => {
      try {
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
        // setCenter([(latMin + latMax)/2, (lonMin + lonMax)/2])
        setBounds([[latMin, lonMin], [latMax, lonMax]])
      } catch {
        // setCenter([45.167320, 5.808467])
        setBounds([[51.096106, -5.925042], [41.359701, 9.851325]])
      }
    }

    const initFirebase = async() => {
      const firebaseConfig = {
        apiKey: "AIzaSyBvfmLzBBH4TQxYRsJ5h_8AN706D92Fv_8",
        authDomain: "gpx-display-24070.firebaseapp.com",
        projectId: "gpx-display-24070",
        storageBucket: "gpx-display-24070.appspot.com",
        messagingSenderId: "1002894159234",
        appId: "1:1002894159234:web:4f878c54f3280975d8b39b"
      };

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      setApp(app)
      console.log('Firebase initialized')
    }

    getTracks()
    initFirebase()
  }, [])

  // from https://stackoverflow.com/questions/64665827/react-leaflet-center-attribute-does-not-change-when-the-center-state-changes
  // to update center

  // function ChangeView({ center, zoom }) {
  //   const map = useMap();
  //   map.setView(center, zoom);
  //   return null;
  // }

  if (bounds === undefined) {
    return <></>
  }


  return (
    <>
    <div className="main-grid">
      <div className='cell-menu'>
        <Menu app={app} />
      </div>

      <div className='cell-map'>
        <Map bounds={bounds} tracks={tracks} selectedTrack={selectedTrack} hoverTrack={hoverTrack}/>
      </div>

      <div className="cell-list">
        <List tracks={tracks} setSelectedTrack={setSelectedTrack} setHoverTrack={setHoverTrack}/>
      </div>

      <div className='cell-description'>
        <Description />
      </div>

    </div>
    </>
  )

}

export default App
