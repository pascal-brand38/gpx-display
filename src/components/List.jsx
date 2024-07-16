// Copyright (c) Pascal Brand
// MIT License

import { FaRegTrashCan } from "react-icons/fa6";
import './List.scss'

function List({onTrash, tracks, currentBounds, selectedTrack, setSelectedTrack, setHoverTrack }) {
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
                onClick={ () => setSelectedTrack(index) }
                onMouseLeave={ () => setHoverTrack(undefined) }
                onMouseOver={ () => setHoverTrack(index) }>
                  <div className='title'> { cleanName(track.meta.name) } </div>
                  <div className='summary'>
                    {(track.meta.startDate) ? track.meta.startDate.toFormat('dd/MM/yyyy') : 'unknown'}
                    {/* {track.meta.startDate} */}
                    {} - {}
                    {track.meta.distance}km
                  </div>
              </button>

              <div className='trash'>
                <FaRegTrashCan onClick={()=>onTrash(index, cleanName(tracks[index].meta.name))}/>
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
