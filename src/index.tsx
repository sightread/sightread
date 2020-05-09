import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./PlaySongPage"
import SelectSong from "./SelectSongPage"
import * as serviceWorker from "./serviceWorker"
import { PlayerProvider } from "./hooks/index"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { StaffPage } from "./StaffPage"

function Root() {
  return (
    <React.StrictMode>
      <PlayerProvider>
        <Router>
          <Route path="/" exact component={SelectSong} />
          <Route path="/play/music/:song_location" component={App} />
          <Route path="/staff" component={StaffPage} />
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
