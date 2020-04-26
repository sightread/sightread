import React, { useState } from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./PlaySongPage"
import SelectSong from "./SelectSong"
import * as serviceWorker from "./serviceWorker"
import { PlayerProvider } from "./hooks/index"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { Song } from "./utils"

function Root() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const handleSelectedSong = (song: Song) => {
    setSelectedSong(song)
  }

  return (
    <React.StrictMode>
      <PlayerProvider>
        <Router>
          <Route
            path="/"
            exact
            render={(props) => (
              <SelectSong
                {...props}
                selectedSong={selectedSong}
                handleSelect={handleSelectedSong}
              />
            )}
          />
          <Route path="/play" exact render={(props) => <App {...props} song={selectedSong} />} />
        </Router>
      </PlayerProvider>
    </React.StrictMode>
  )
}

ReactDOM.render(<Root />, document.getElementById("root"))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
