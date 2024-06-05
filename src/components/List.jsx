// Copyright (c) Pascal Brand
// MIT License

import './List.scss'

function List({tracks, setSelectedTrack, setHoverTrack}) {
  return (
    <div className='list'>
    {
      tracks.map((track, index) => {
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
      })
    }
    </div>
  )
}

export { List }
