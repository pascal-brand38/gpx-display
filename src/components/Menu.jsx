// Copyright (c) Pascal Brand
// MIT License

import { useState, useEffect } from 'react'
import authenticate from '../hooks/authenticate';
import storage from '../hooks/storage';
import convert from '../hooks/convert';
import city from '../hooks/city';
import RchDropdown from './RchDropdown'

import './Menu.scss'

function Menu({tracks, setTracks, setFirstBounds, setSelectedTrack, setHoverTrack, userCredential, setUserCredential, setLoading}) {
  // States for registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Handling the form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true)
    await authenticate.signUp(email, password, setEmail, setPassword, setMessage, setUserCredential)
    setLoading(false)
  }
  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true)
    await authenticate.signIn(email, password, setEmail, setPassword, setMessage, setUserCredential)
    setLoading(false)
  }

  const handleUploadGPX = async (e) => {
    // https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    e.preventDefault();
    setLoading(true)
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
          tracks = tracks.filter(t => t.meta.epoch !== track.meta.epoch)
        }
        tracks = tracks.filter(t => t.meta.gpxFilename !== track.meta.gpxFilename)

        tracks.push(track)
      })
    )

    // sort the tracks by start time, in reverse order
    tracks = tracks.sort((a, b) => {
      if (a.meta.epoch === undefined) {
        return -1
      } else if (b.meta.epoch === undefined) {
        return +1
      } else {
        return b.meta.epoch - a.meta.epoch
      }
    })

    // setTracks(tracks) does not rerender as tracks is not changed (still an array at the same address)
    setTracks([...tracks])
    await storage.uploadTracks(userCredential, tracks)
    setLoading(false)
  }

  // temporary, to speed-up tests - remove it in production
  useEffect(() => {
    authenticate.signIn('toto@titi.fr', 'tototo', setEmail, setPassword, setMessage, setUserCredential)
  }, [])

  useEffect(() => {
    // load all.json file to have all the tracks
    if (userCredential !== undefined) {
      setTracks([])
      setSelectedTrack(undefined)
      setHoverTrack(undefined)
      storage.fetchTracks(userCredential, setTracks, setFirstBounds)
    }
  }, [userCredential])

  const list = ['item-1', 'item-2']

  return (
    <div className="menu">
      <form>
        <div className='menu__email'>
          <label>Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
          />
        </div>

        <div className='menu__password'>
          <label>Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
          />
        </div>

        <button className='menu__button' disabled={((email === '') || (password === ''))} onClick={handleSignup} type="submit">
          Sign Up
        </button>
        <button className='menu__button' disabled={((email === '') || (password === ''))} onClick={handleSignin} type="submit">
          Sign In
        </button>

        <div className='menu__message'>
          { message }
        </div>

        { /* https://stackoverflow.com/questions/39484895/how-to-allow-input-type-file-to-select-the-same-file-in-react-component
             onClick event is used to upload the same file several times */ }
        <label className='menu__button' htmlFor="upload_gpx" > Upload GPX </label>
        <input multiple style={{display:'none'}} type="file" id="upload_gpx" name="upload_gpx" accept=".gpx" onChange={handleUploadGPX} onClick={(e) => e.target.value=null}/>

          <RchDropdown
              type='dropdown'
              initialValue='item-1'
              list={list}
              valueFromItem={(s) => s}
              onSelect={(obj) => console.log(obj.item)}
              />
      </form>


    </div>
  );
}


export { Menu }
