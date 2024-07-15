// Copyright (c) Pascal Brand
// MIT License

import { FaRegTrashCan } from "react-icons/fa6";

import './List.scss'
import storage from '../hooks/storage'


// import city from '../hooks/city'

function List({tracks, setTracks, currentBounds, selectedTrack, setSelectedTrack, setHoverTrack, userCredential, setLoading}) {
  if (currentBounds === undefined) {
    return
  }

  const isTrackInside = (track, currentBounds) => {
    const isInside = (value, min, max) => ((min <= value) && (value <= max))
    return track.points.some(p =>
      isInside(p.lat, currentBounds[0][0], currentBounds[1][0]) &&
      isInside(p.lon, currentBounds[0][1], currentBounds[1][1])
    )
  }

  const onClick = (index) => {
    setSelectedTrack(index)
    const track = tracks[index]
    console.log(track.meta.cities)
  }

  const onTrash = async (index) => {
    setLoading(true)
    if (index === selectedTrack) {
      setSelectedTrack(undefined)
    }
    await storage.removeFilename(userCredential, tracks[index].meta.gpxFilename)
    if (tracks.length === 1) {
      tracks = []
    } else {
      tracks.splice(index, index)
    }
    await storage.uploadTracks(userCredential, tracks)

    // setTracks(tracks) does not rerender as tracks is not changed (still an array at the same address)
    setTracks([...tracks])
    setLoading(false)
  }

  const cleanName = (name) => {
    const regex = /-[0-9]+$/i
    return name.replace('<![CDATA[', '').replace(']]>', '').replace(regex, '')
  }

  return (
    <div className='list'>
    {
      tracks.map((track, index) => {
        if (isTrackInside(track, currentBounds)) {
          const addClass = ((index === selectedTrack) ? "selected" : "")
          return (
            <div key={index} className='item'>
              <button className={addClass}
                onClick={()=>onClick(index)}
                onMouseLeave={()=>setHoverTrack(undefined)}
                onMouseOver={()=>setHoverTrack(index)}>
                  <div className='title'> { cleanName(track.meta.name) } </div>
                  <div className='summary'>
                    {(track.meta.startDate) ? track.meta.startDate.toFormat('dd/MM/yyyy') : 'unknown'}
                    {/* {track.meta.startDate} */}
                    {} - {}
                    {track.meta.distance}km
                  </div>
              </button>

              <div className='trash'>
                <FaRegTrashCan onClick={()=>onTrash(index)}/>
              </div>
            </div>
          )
        } else {
          return (
            <div key={index}>
                  </div>
          )
        }
      })
    }
    </div>
  )
}

export { List }
