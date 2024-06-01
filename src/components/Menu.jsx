// Copyright (c) Pascal Brand
// MIT License

import { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import './Menu.scss'


function Sign() {
  // States for registration
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [message, setMessage] = useState("");

  // Handling the email change
  const handleEmail = (e) => {
    setDisabled((e.target.value === '') || (password === ''))
    setEmail(e.target.value);
  };

  // Handling the password change
  const handlePassword = (e) => {
    setDisabled((e.target.value === '') || (email === ''))
    setPassword(e.target.value);
  };

  // Handling the form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setMessage('Hello ' + userCredential.user.email)
        // ...
      })
      .catch((error) => {
        console.log('ERROR:', error)
        setMessage(`Signup FAILED`)
      });
  }

  const handleSignin = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        setMessage('Hello ' + userCredential.user.email)
      })
      .catch((error) => {
        console.log('ERROR:', error)
        setMessage(`Signin FAILED`)
      });
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

        <button disabled={disabled} onClick={handleSignup} type="submit">
          Sign Up
        </button>
        <button disabled={disabled} onClick={handleSignin} type="submit">
          Sign In
        </button>

        <div>
          { message }
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
