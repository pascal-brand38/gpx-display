// Copyright (c) Pascal Brand
// MIT License

import { useState, useEffect } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, uploadString, getBlob } from "firebase/storage";

import './Menu.scss'

/*
        const filename = 'test.txt'
        const storage = getStorage();
        const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);
        return getBlob(storageRef)
        })
      .then((blob) => blob.text())
      .then(text => console.log(text))
      .catch((error) => {
        // check https://firebase.google.com/docs/storage/web/download-files?hl=fr
        // and https://firebase.google.com/docs/storage/web/handle-errors
        console.log(`STORAGE ERROR ${error}`)


      })
*/

function Sign() {
  // States for registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userCredential, setUserCredential] = useState(undefined)

  // Handling the email change
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  // Handling the password change
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  // Handling the form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setMessage('Hello ' + userCredential.user.email)
        setUserCredential(userCredential)
      })
      .catch((error) => {
        console.log('SIGN UP ERROR:', error)
        setMessage(`Signup FAILED`)
        setUserCredential(undefined)
      });
  }

  const signIn = async (email, password) => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setMessage('Hello ' + userCredential.user.email)
        setUserCredential(userCredential)
      })
      .catch((error) => {
        console.log('SIGN IN ERROR:', error)
        setMessage(`Signin FAILED`)
        setUserCredential(undefined)
      });
  }

  const handleSignin = async (e) => {
    e.preventDefault();
    signIn(email, password)
  }

  const handleUploadGPX = async (e) => {
    // https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    e.preventDefault();
    const filename = e.target.files[0].name
    const file = e.target.files.item(0)
    const storage = getStorage();
    const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);

    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded');
    });

    console.log(userCredential)
  }

  // temporary, to speed-up tests
  // remove it in production
  useEffect(() => {
    setEmail('toto@titi.fr');
    setPassword('tototo');
    signIn('toto@titi.fr', 'tototo')
  }, [])

  return (
    <div className="menu">
      <form>
        <div className='email'>
          <label>Email</label>
          <input
            onChange={handleEmail}
            value={email}
            type="email"
          />
        </div>

        <div className='password'>
          <label>Password</label>
          <input
            onChange={handlePassword}
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
function Menu({app}) {
  if (app === undefined) {
    return (
      <div style={{textAlign:"center"}}>
        !!! Waiting for Firebase connexion !!!
      </div>
    )

  } else {
    return (
      <div style={{textAlign:"center"}}>
        <Sign />
      </div>
    )
  }
}

export { Menu }
