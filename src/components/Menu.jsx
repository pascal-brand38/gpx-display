// Copyright (c) Pascal Brand
// MIT License

import { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, uploadString } from "firebase/storage";

import './Menu.scss'


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

  const handleSignin = async (e) => {
    e.preventDefault();

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

  const handleUploadGPX = async (e) => {
    // TOOD: not re-run when same file is selected
    // TODO: UTF8 is wrong?
    // https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    e.preventDefault();
    const filename = e.target.files[0].name
    const file = e.target.files.item(0)
    const storage = getStorage();
    const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);


    /*
    const text = await file.text();
    console.log(text)
    uploadString(storageRef, text).then((snapshot) => {
      console.log('Uploaded a blob or file!');
      console.log(snapshot)
    });
    */
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded a blob or file!');
      console.log(snapshot)
    });

    console.log(userCredential)
  }


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

        { /* should be a button if possible to disable it */ }
        <div className='button' disabled={userCredential===undefined}>
          <label htmlFor="upload_gpx">Upload GPX</label>
          <input disabled={userCredential===undefined} style={{display:'none'}} type="file" id="upload_gpx" name="upload_gpx"  onChange={handleUploadGPX} />
        </div>
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
