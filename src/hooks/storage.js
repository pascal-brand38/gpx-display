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

async function uploadBlob(userCredential, filename, blob) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);

  uploadBytes(storageRef, blob).then((snapshot) => {
    console.log('Uploaded');
  });
}

async function uploadStringToUser(userCredential, filename, string) {
  const storage = getStorage();
  const storageRef = ref(storage, `users/${userCredential.user.uid}/${filename}`);

  uploadString(storageRef, string).then((snapshot) => {
    console.log('Uploaded');
  });
}


async function fetchTracks(userCredential, setTracks, setBounds)  {
  try {
    const blob = await downloadBlob(userCredential, jsonFormatFilename)
    const r = await blob.text()
    const jsonFormat = JSON.parse(r)
    const tracks = convert.jsonFormatToTracks(jsonFormat)
    setTracks(tracks)

    let latMin = tracks[0].points[0].lat
    let latMax = latMin
    let lonMin = tracks[0].points[0].lon
    let lonMax = lonMin

    tracks.forEach(track => {
      track.points.forEach(p => {
        latMin = Math.min(latMin, p.lat)
        latMax = Math.max(latMax, p.lat)
        lonMin = Math.min(lonMin, p.lon)
        lonMax = Math.max(lonMax, p.lon)
      })
    })
    setBounds([[latMin, lonMin], [latMax, lonMax]])
  } catch {
    setTracks([])
    setBounds([[51.096106, -5.925042], [41.359701, 9.851325]])
  }
}



export default {
  downloadBlob,
  uploadBlob,
  uploadStringToUser,
  fetchTracks,
  jsonFormatFilename,
}
