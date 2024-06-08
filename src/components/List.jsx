// Copyright (c) Pascal Brand
// MIT License

import './List.scss'

function List({tracks, currentBounds, setSelectedTrack, setHoverTrack}) {
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

  return (
    <div className='list'>
    {
      tracks.map((track, index) => {
        if (isTrackInside(track, currentBounds)) {
          return (
            <div key={index}>
              <button
                onClick={()=>setSelectedTrack(index)}
                onMouseLeave={()=>setHoverTrack(undefined)}
                onMouseOver={()=>setHoverTrack(index)}>
                  <div className='title'> {track.meta.name} </div>
                  <div className='summary'>
                    {(track.meta.startDate) ? track.meta.startDate.toFormat('dd/MM/yyyy') : 'unknown'}
                    {/* {track.meta.startDate} */}
                    {} - {}
                    {track.meta.distance}km
                  </div>
              </button>
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
