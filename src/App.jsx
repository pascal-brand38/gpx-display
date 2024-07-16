// Copyright (c) Pascal Brand
// MIT License

import { useState, useRef, useEffect } from 'react'
import './App.css'
import { initializeApp } from "firebase/app";

import { Menu } from './components/Menu';
import { Description } from './components/Description';
import { Map } from './components/Map';
import { List } from './components/List';
import { Loading, YesNo } from './components/Modal';

import storage from './hooks/storage';
import convert from './hooks/convert';
import city from './hooks/city';

function App() {
  const [ app, setApp ] = useState(undefined)                         // firebase initialization
  const [ userCredential, setUserCredential ] = useState(undefined)   // firebase user credential when signed

  const [ tracks, setTracks ] = useState([])                          // all the tracks, as a jsonFormat format
  const [ selectedTrack, setSelectedTrack ] = useState(undefined)     // index of the selected track
  const [ hoverTrack, setHoverTrack ] = useState(undefined)           // index of the hovered track
  const [ firstBounds, setFirstBounds ] = useState(undefined)         // first bounds to be displayed
  const [ currentBounds, setCurrentBounds ] = useState(undefined)     // the current bounds of the displayed map
  const [ loading, setLoading] = useState(false)
  const [ messageBlock, setMessageBlock] = useState(undefined)

  const handleUploadGPX = async (e) => {
    // https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    e.preventDefault();
    setLoading(true)
    let newTracks = tracks
    await city.getGeonames()
    await Promise.all(
      Array.from(e.target.files).map(async (file, index) => {
        const filename = file.name
        const blob = e.target.files.item(index)
        await storage.uploadBlob(userCredential, filename, blob)
        const gpxXml = await blob.text()
        const track = convert.gpxToTrack(gpxXml, filename)

        // remove duplicates
        if (track.meta.epoch !== undefined) {
          newTracks = newTracks.filter(t => t.meta.epoch !== track.meta.epoch)
        }
        newTracks = newTracks.filter(t => t.meta.gpxFilename !== track.meta.gpxFilename)

        newTracks.push(track)
      })
    )

    // sort the tracks by start time, in reverse order
    newTracks = newTracks.sort((a, b) => {
      if (a.meta.epoch === undefined) {
        return -1
      } else if (b.meta.epoch === undefined) {
        return +1
      } else {
        return b.meta.epoch - a.meta.epoch
      }
    })

    // setTracks(tracks) does not rerender as tracks is not changed (still an array at the same address)
    setTracks([...newTracks])
    await storage.uploadTracks(userCredential, newTracks)
    setLoading(false)
  }

  const onTrash = async (index, displayName) => {
    const trash = async (yesorno) => {
      setMessageBlock(undefined)
      if (yesorno) {
        setLoading(true)
        if (index === selectedTrack) {
          setSelectedTrack(undefined)
        }
        await storage.removeFilename(userCredential, tracks[index].meta.gpxFilename)
          .catch(error => console.log(`Cannot remove file ${tracks[index].meta.gpxFilename}`))
        tracks.splice(index, 1)
        console.log(tracks)

        await storage.uploadTracks(userCredential, tracks)

        // setTracks(tracks) does not rerender as tracks is not changed (still an array at the same address)
        setTracks([...tracks])
        setLoading(false)
      }
    }

    const MessageBlock = () => YesNo('Confirmation de suppression du parcours ?', displayName, trash);
    setMessageBlock(MessageBlock)
  }


  // On the application initialization, initialize firebase
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

  // when credentials are changed
  // load all.json file to have all the tracks, and reset selected and hovered tracks
  useEffect(() => {
    const initTracks = async () => {
      setLoading(true)
      setTracks([])
      setSelectedTrack(undefined)
      setHoverTrack(undefined)
      await storage.fetchTracks(userCredential, setTracks, setFirstBounds)
      setLoading(false)
    }
    if (userCredential !== undefined) {
      initTracks()
    }
  }, [userCredential])

  // from https://stackoverflow.com/questions/64665827/react-leaflet-center-attribute-does-not-change-when-the-center-state-changes
  // to update center

  // function ChangeView({ center, zoom }) {
  //   const map = useMap();
  //   map.setView(center, zoom);
  //   return null;
  // }

  if (app === undefined) {
    return
  }

  return (
    <div className="main-grid">
      <div className='cell-menu'>
        <Menu
          handleUploadGPX={handleUploadGPX}
          setUserCredential={setUserCredential}
          setLoading={setLoading}
        />
      </div>

      <div className='cell-map'>
        <Map firstBounds={firstBounds} tracks={tracks} selectedTrack={selectedTrack} hoverTrack={hoverTrack} setCurrentBounds={setCurrentBounds} />
      </div>

      <div className="cell-list">
        <List
          onTrash={onTrash}
          tracks={tracks}
          currentBounds={currentBounds}
          selectedTrack={selectedTrack} setSelectedTrack={setSelectedTrack}
          setHoverTrack={setHoverTrack}
        />
      </div>

      <div className='cell-description'>
        <Description tracks={tracks} selectedTrack={selectedTrack} />
      </div>

      {loading && <Loading />}
      {messageBlock && messageBlock}
    </div>
  )

}

export default App
