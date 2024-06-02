// Copyright (c) Pascal Brand
// MIT License

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

async function _sign(isSignUp, email, password, setEmail, setPassword, setMessage, setUserCredential) {
  setEmail('')
  setPassword('')
  const authFunction = (isSignUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword)

  const auth = getAuth();
  authFunction(auth, email, password)
    .then((userCredential) => {
      setMessage('Hello ' + userCredential.user.email)
      setUserCredential(userCredential)
      setEmail('')
    })
    .catch((error) => {
      console.log('SIGN UP ERROR:', error)
      setMessage(`Signup FAILED`)
      setUserCredential(undefined)
    });
}

export default {
  signIn: (email, password, setEmail, setPassword, setMessage, setUserCredential) =>
    _sign(false, email, password, setEmail, setPassword, setMessage, setUserCredential),
  signUp: (email, password, setEmail, setPassword, setMessage, setUserCredential) =>
    _sign(true, email, password, setEmail, setPassword, setMessage, setUserCredential),
}
