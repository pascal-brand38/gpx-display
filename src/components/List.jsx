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
            <button onClick={()=>setSelectedTrack(index)} onMouseOver={()=>setHoverTrack(index)}> {track.meta.name} </button>
          </div>
        )
      })
    }
    </div>
  )
}

export { List }
