// Copyright (c) Pascal Brand
// MIT License

import { getStorage, ref, uploadBytes, uploadString, getBlob } from "firebase/storage";
import convert from "./convert";

const jsonFormatFilename = 'all-tracks.json'

// check https://firebase.google.com/docs/storage/web/download-files?hl=fr
// and https://firebase.google.com/docs/storage/web/handle-errors
async function downloadBlob(userCredential, filename) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);
  return getBlob(storageRef)
}

async function downloadPublicBlob(filename) {
  const storage = getStorage();
  const storageRef = ref(storage, `public/${filename}`);
  return getBlob(storageRef)
}

async function uploadBlob(userCredential, filename, blob) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);

  uploadBytes(storageRef, blob).then((snapshot) => {
    console.log(`Uploaded ${filename}`);
  });
}

async function uploadStringToUser(userCredential, filename, string) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);

  uploadString(storageRef, string).then((snapshot) => {
    console.log(`Uploaded ${filename}`);
  });
}

async function uploadPublicString(filename, string) {
  const storage = getStorage();
  const storageRef = ref(storage, `public/${filename}`);

  uploadString(storageRef, string).then((snapshot) => {
    console.log(`Uploaded ${filename}`);
  });
}


async function fetchTracks(userCredential, setTracks, setBounds)  {
  try {
    const blob = await downloadBlob(userCredential, jsonFormatFilename)
    const r = await blob.text()
    const jsonFormat = JSON.parse(r)
    const tracks = convert.jsonFormatToTracks(jsonFormat)
    setTracks(tracks)

    let latMin = tracks[0].meta.bounds[0][0]
    let latMax = tracks[0].meta.bounds[1][0]
    let lonMin = tracks[0].meta.bounds[0][1]
    let lonMax = tracks[0].meta.bounds[1][1]

    tracks.forEach(track => {
      latMin = Math.min(latMin, track.meta.bounds[0][0])
      latMax = Math.max(latMax, track.meta.bounds[1][0])
      lonMin = Math.min(lonMin, track.meta.bounds[0][1])
      lonMax = Math.max(lonMax, track.meta.bounds[1][1])
    })
    setBounds([[latMin, lonMin], [latMax, lonMax]])
  } catch {
    setTracks([])
    setBounds([[51.096106, -5.925042], [41.359701, 9.851325]])
  }
}



export default {
  downloadBlob,
  downloadPublicBlob,
  uploadBlob,
  uploadStringToUser,
  uploadPublicString,
  fetchTracks,
  jsonFormatFilename,
}
