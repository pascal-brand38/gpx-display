// Copyright (c) Pascal Brand
// MIT License

import { useState, useEffect } from 'react'
import authenticate from '../hooks/authenticate';
import storage from '../hooks/storage';
import convert from '../hooks/convert';

import './Menu.scss'

function Sign({tracks, setTracks, setBounds}) {
  // States for registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userCredential, setUserCredential] = useState(undefined)

  // Handling the form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    authenticate.signUp(email, password, setEmail, setPassword, setMessage, setUserCredential)
  }
  const handleSignin = async (e) => {
    e.preventDefault();
    authenticate.signIn(email, password, setEmail, setPassword, setMessage, setUserCredential)
  }

  const handleUploadGPX = async (e) => {
    // https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    e.preventDefault();
    const filename = e.target.files[0].name
    const blob = e.target.files.item(0)
    storage.uploadBlob(userCredential, filename, blob)
    blob.text().then(gpxXml => {
      const track = convert.gpxToTrack(gpxXml, filename)

      // remove duplicates
      tracks = tracks.filter(t => t.meta.epoch !== track.meta.epoch)
      tracks.push(track)

      // sort the tracks by start time
      tracks.sort((a, b) => a.meta.epoch - b.meta.epoch)

      // setTracks(tracks) does not rerender as tracks is not changed (still an array at the same address)
      setTracks([...tracks])

      const jsonFormat = convert.tracksToJsonFormat(tracks)
      const string = JSON.stringify(jsonFormat)
      storage.uploadStringToUser(userCredential, storage.jsonFormatFilename, string)
    })
  }

  // temporary, to speed-up tests - remove it in production
  useEffect(() => {
    authenticate.signIn('toto@titi.fr', 'tototo', setEmail, setPassword, setMessage, setUserCredential)
  }, [])

  useEffect(() => {
    // load all.json file to have all the tracks
    if (userCredential !== undefined) {
      storage.fetchTracks(userCredential, setTracks, setBounds)
    }
  }, [userCredential])

  return (
    <div className="menu">
      <form>
        <div className='email'>
          <label>Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
          />
        </div>

        <div className='password'>
          <label>Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
          />
        </div>

        <button disabled={((email === '') || (password === ''))} onClick={handleSignup} type="submit">
          Sign Up
        </button>
        <button disabled={((email === '') || (password === ''))} onClick={handleSignin} type="submit">
          Sign In
        </button>

        <div>
          { message }
        </div>

        { /* https://stackoverflow.com/questions/39484895/how-to-allow-input-type-file-to-select-the-same-file-in-react-component
             onClick event is used to upload the same file several times */ }
        <label htmlFor="upload_gpx" className={'button' + (userCredential===undefined ? ' button-disabled' : '')} > Upload GPX </label>
        <input style={{display:'none'}} type="file" id="upload_gpx" name="upload_gpx" onChange={handleUploadGPX} onClick={(e) => e.target.value=null}/>
      </form>

    </div>
  );
}


// app is undefined till the firebase application is initialized, which is required to authenticate
function Menu({app, tracks, setTracks, setBounds}) {
  if (app === undefined) {
    return (
      <div style={{textAlign:"center"}}>
        !!! Waiting for Firebase connexion !!!
      </div>
    )

  } else {
    return (
      <div style={{textAlign:"center"}}>
        <Sign tracks={tracks} setTracks={setTracks} setBounds={setBounds} />
      </div>
    )
  }
}

export { Menu }
