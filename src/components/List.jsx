// Copyright (c) Pascal Brand
// MIT License

import './List.scss'
import city from '../hooks/city'

function List({tracks, currentBounds, selectedTrack, setSelectedTrack, setHoverTrack}) {
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

  const onClick = async (index) => {
    setSelectedTrack(index)

    await city.getGeonames()
    const track = tracks[index]
    city.filterGeonames(track.meta.bounds)
    const cities = track.points.map((p, index) => city.getCity(p.lat, p.lon, ((index==0) || (index==track.points.length-1))))

    let prev = undefined
    cities.forEach(city => {
      if ((city !== prev) && (city !== undefined)) {
        prev = city
        if (city !== undefined) {
          console.log(city)
        }
      }
    })
  }

  return (
    <div className='list'>
    {
      tracks.map((track, index) => {
        if (isTrackInside(track, currentBounds)) {
          const addClass = ((index === selectedTrack) ? "selected" : "")
          return (
            <div key={index}>
              <button className={addClass}
                onClick={()=>onClick(index)}
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
