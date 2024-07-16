// Copyright (c) Pascal Brand
// MIT License

import { useState, useEffect } from 'react'
import authenticate from '../hooks/authenticate';
import RchDropdown from './RchDropdown'

import './Menu.scss'

function Menu({ handleUploadGPX, setUserCredential, setLoading}) {
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

  // temporary, to speed-up tests - remove it in production
  useEffect(() => {
    authenticate.signIn('toto@titi.fr', 'tototo', setEmail, setPassword, setMessage, setUserCredential)
  }, [])

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
