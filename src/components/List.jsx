// Copyright (c) Pascal Brand
// MIT License

function List({tracks, setSelectedTrack, setHoverTrack}) {
  return (
    <div>
    {
      tracks.map((track, index) => {
        return (
          <div>
            <button key={index} onClick={()=>setSelectedTrack(index)} onMouseOver={()=>setHoverTrack(index)}> {track.meta.name} </button>
          </div>
        )
      })
    }
    </div>
  )
}

export { List }
