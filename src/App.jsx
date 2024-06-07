// Copyright (c) Pascal Brand
// MIT License

import { useState, useRef, useEffect } from 'react'
import './App.css'
import { initializeApp } from "firebase/app";

import { Menu } from './components/Menu';
import { Description } from './components/Description';
import { Map } from './components/Map';
import { List } from './components/List';

function App() {
  // https://urfdvw.github.io/react-local-file-system/
  // https://classic.yarnpkg.com/en/package/react-local-file-system
  // https://www.npmjs.com/package/react-local-file-system

  // https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react


  // const str = fs.readFileSync('C:\\Users\\pasca\\Downloads\\activity_allemans_levignac_2ePyKv0W9XA8eFYoEL8tlEXSA01.gpx')
  // console.log(str)
  const [ app, setApp ] = useState(undefined)                         // firebase initialization
  const [ tracks, setTracks ] = useState([])                          // all the tracks, as a jsonFormat format
  const [ selectedTrack, setSelectedTrack ] = useState(undefined)     // index of the selected track
  const [ hoverTrack, setHoverTrack ] = useState(undefined)           // index of the hovered track
  const [ firstBounds, setFirstBounds ] = useState(undefined)         // first bounds to be displayed
  const [ currentBounds, setCurrentBounds ] = useState(undefined)     // the current bounds of the displayed map

  useEffect(() => {
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

    initFirebase()
  }, [])

  // from https://stackoverflow.com/questions/64665827/react-leaflet-center-attribute-does-not-change-when-the-center-state-changes
  // to update center

  // function ChangeView({ center, zoom }) {
  //   const map = useMap();
  //   map.setView(center, zoom);
  //   return null;
  // }

  return (
    <>
    <div className="main-grid">
      <div className='cell-menu'>
        <Menu app={app} tracks={tracks} setTracks={setTracks} setFirstBounds={setFirstBounds} setSelectedTrack={setSelectedTrack} setHoverTrack={setHoverTrack}/>
      </div>

      <div className='cell-map'>
        <Map firstBounds={firstBounds} tracks={tracks} selectedTrack={selectedTrack} hoverTrack={hoverTrack} setCurrentBounds={setCurrentBounds} />
      </div>

      <div className="cell-list">
        <List tracks={tracks} currentBounds={currentBounds} setSelectedTrack={setSelectedTrack} setHoverTrack={setHoverTrack}/>
      </div>

      <div className='cell-description'>
        <Description />
      </div>

    </div>
    </>
  )

}

export default App
