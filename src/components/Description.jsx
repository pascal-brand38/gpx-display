// Copyright (c) Pascal Brand
// MIT License

function Description({ tracks, selectedTrack }) {
  if ((tracks !== undefined) && (selectedTrack !== undefined) && (selectedTrack < tracks.length)) {
    const track = tracks[selectedTrack]
    const cities = track.meta.cities
    return (
      <div style={{textAlign:"center"}}>
        {
        cities.map((city, index) => {
          return (
            <p key={index}> {city} </p>
          )
        })}
      </div>
    )
  }
}

export { Description }


// TODO: be able to click on a city and show it on the map
// TODO: detect the heights, les cols
// TODO: display elevation cumul
