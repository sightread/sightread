import React, { useState } from "react"
import "./App.css"
import "./SelectSong.css"
import { useHistory } from "react-router-dom"

const headers = [
  { label: "Title", id: "title", align: "left" },
  // { label: "difficulty", id: "difficulty" },
]

const data = [
  "  3.1.a.Fur_Elise.xml",
  "Abba - Dancing Queen.mid",
  "Abba - The Winner Takes It All - EASY.mid",
  "Alan Walker - Darkside.mid",
  "Alan Walker - On My Way.mid",
  "Alan Walker - The Spectre.mid",
  "Alan_Walker_Faded.mid",
  "Alec Benjamin - Let Me Down Slowly.mid",
  "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK.mid",
  "Ariana Grande - Only 1.mid",
  "Assassin's Creed 3 - Main Theme - EASY.mid",
  "Attack_On_Titan_Theme_Guren_No_Yumiya.mid",
  "BTS - Black Swan.mid",
  "BTS - Spring Day.mid",
  "Backstreet Boys - I Need You Tonight.mid",
  "Billie Eilish - Bad Guy.mid",
  "Billie Eilish - Six Feet Under.mid",
  "Billie Eilish ft. Khalid - Lovely.mid",
  "Breathe_No_More_-_Evanescence.mid",
  "Bruno Mars - Count On Me.mid",
  "Bruno Mars - Talking to the Moon.mid",
  "Calum Scott - Dancing On My Own.mid",
  "Calum Scott - You Are The Reason.mid",
  "Camila Cabello - Havana.mid",
  "Canon_Rock.xml",
  "Clair_de_Lune.mid",
  "Coldplay - Clocks.mid",
  "Craig Armstrong - Love Actually - Soundtrack.mid",
  "Curb Your Enthusiasm.mid",
  "Demi Lovato - Cool For The Summer.mid",
  "Discord - The Living Tombston.mid",
  "Dua Lipa - Don't Start Now.mid",
  "Ed Sheeran - Nancy Mulligan.mid",
  "Ed Sheeran - Perfect.mid",
  "Edith Piaf - La Foule (subtitulos en francés y en español).mid",
  "Elton John - I am Still Standing.mid",
  "Elvis Presley - Can't Help Falling in Love with You - EASY.mid",
  "Eric Thiman - Flood Time.mid",
  "Evanescence - My Immortal.mid",
  "Franz Gruber - Silent Night - EASY.mid",
  "GoT.xml",
  "Goodbye+-+Hachiko+Theme.mid",
  "Gravity Falls - Theme.mid",
  "GunsNRoses - Sweet Child O' Mine.mid",
  "Halo-One-Final-Effort-altered.mid",
  "Happy Birthday - Chopin and Liszt style.mid",
  "Imagine Dragons - Believer.mid",
  "James Arthur - Empty Space.mid",
  "James Bay - Us.mid",
  "James Blunt - You Are Beautiful - EASY.mid",
  "Jem Finer, Shane MacGowan - Fairytale of New York.mid",
  "Joe Cocker - You Are So Beautiful.mid",
  "Joe Hisaishi - Ballade (Brothers).mid",
  "Joe Hisaishi - Laputa - Castle In The Sky (1986) Main Theme - EASY.mid",
  "Joe Hisaishi - Summer.mid",
  "Johann Pachelbel - Canon in D - EASY.mid",
  "Johann Strauss - Radetzky March - EASY.mid",
  "John Denver - Take Me Home, Country Roads - EASY.mid",
  "Justin Bieber - Purpose.mid",
  "Kodaline - Brother.mid",
  "Kung Fu Panda - Oogway Ascends - EASY.mid",
  "Leonard Cohen - Hallelujah.mid",
  "Lewis Capaldi - Someone You Loved.mid",
  "Linkin Park - In The End (Mellen Gi _ Tommee Profitt Remix).mid",
  "Lord Huron - The Night We Met - 13 Reasons Why.mid",
  "Ludwig Van Beethoven - 7th Symphony - 2nd movement - Easy.mid",
  "Mad World - Gary Jules.mid",
  "Maroon 5 - Memories.mid",
  "Maroon 5 - Misery.mid",
  "Melanie Martinez - Cake.mid",
  "Melanie Martinez - Soap - EASY.mid",
  "Metallica_-_Nothing_Else_Matters_piano_solo.mid",
  "Mozart - Lacrimosa (Requiem).mid",
  "Mozart - Sonata In C Major - K545 - EASY.mid",
  "Mozart - Sonata no. 12, K332.mid",
  "Mozart - Turkish March.midi",
  "My Chemical Romance - Teenagers.mid",
  "NF - Let You Down.mid",
  "NLE Choppa - Camelot.mid",
  "One Final Effort - Halo 3.xml",
  "Panic! at the Disco - I Write Sins Not Tragedies.mid",
  "Passenger - Let Her Go - EASY.mid",
  "Persona 5 - Hymn of the Soul.mid",
  "Piano Hero 001 - C2C - Down The Road.mid",
  "Piano Hero 002 - Deadmau5 - Raise Your Weapon (Madeon Remix).mid",
  "Piano Hero 003 - HearthStone - Main Theme.mid",
  "Piano Hero 005 - Razihel - Bad Boy.mid",
  "Piano Hero 006 - Savant - Sledgehammer.mid",
  "Piano Hero 007 - Hardwell - Mad World.mid",
  "Piano Hero 008 - TheFatRat - Xenogenesis.mid",
  "Piano Hero 009 - Adele - Hello.mid",
  "Piano Hero 010 - DragonForce - Through The Fire And Flames.mid",
  "Piano Hero 011 - Savant - Starfish.mid",
  "Piano Hero 012 - Knife Party - Bonfire.mid",
  "Piano Hero 013 - KDrew - Bullseye.mid",
  "Piano Hero 014 - Feed Me - One Click Headshot.mid",
  "Piano Hero 015 - Fort Minor - Remember The Name.mid",
  "Piano_Man_Piano.mid",
  "Pokemon_Theme_Song_piano.mid",
  "Rachmaninoff - Piano Concerto No.2 op.18 - Piano Solo - EASY.mid",
  "Requiem for a dream.mid",
  "RiverFlowsInYou.mid",
  "Ruel - Hard Sometimes.mid",
  "Ruel - Say.mid",
  "Sam Smith - Lay Me Down - EASY.mid",
  "Scott-Joplin-The-Entertainer.mid",
  "Selena Gomez - Rare.mid",
  "Shawn Mendes - Life of The Party.mid",
  "Shawn Mendes, Camila Cabello - Senorita.mid",
  "Steven Universe - Amalgam.mid",
  "Steven Universe - Full Theme.mid",
  "Steven Universe - Love Like You.mid",
  "Sting - Every Breath You Take.mid",
  "Sting - Fields of Gold.mid",
  "Stranger Things - Theme.mid",
  "The Beatles (John Lennon) - Real Love.mid",
  "The Beatles (John Lennon) - Twist and Shout.mid",
  "The Beatles - Let it Be.mid",
  "The Cranberries - ZOMBIE.mid",
  "The Office.xml",
  "The Weeknd - Blinding Lights.mid",
  "The Witcher 3 - Blood and Wine.mid",
  "The-Daydream-Tears.mid",
  "The-Godfather-Theme.mid",
  "The_Scientist_-_Coldplay_Piano_Arrangement.mid",
  "Tones and I - Dance Monkey.mid",
  "Train - Play That Song - EASY.mid",
  "Twenty One Pilots - Implicit Demand For Proof.mid",
  "Twenty One Pilots - Kitchen Sink.mid",
  "Twenty One Pilots - Trees - EASY.mid",
  "Twenty one Pilots - Truce - Easy.mid",
  "Victory - Two Steps From Hell .mid",
  "Vittorio Monti - Czardas.mid",
  "We The Kings - Sad Song.mid",
  "Westworld_Theme.mid",
  "XXXTENTACION - Sad!.mid",
  "Yiruma - Spring Time.mid",
  "adventure-time.mid",
  "canond-easy.xml",
  "drake-passionfruit.xml",
  "fireflies.mid",
  "fireflies.xml",
  "flat-fur-elise-1-piano.xml",
  "lose-yourself.xml",
  "moonlight-sonata.xml",
  "pirates-carribean-medley.xml",
  "river-flows-in-you.xml",
  "xx-intro.mid",
]

function SelectSongPage() {
  const [search, setSearch] = useState("")
  const history = useHistory()

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value)
  }
  const songContainsWord = (songData: any, searchWord: string) => {
    return Object.values(songData).some((value: any) =>
      value.toLowerCase().includes(searchWord.toLowerCase()),
    )
  }

  const cellStyle: React.CSSProperties = {
    textAlign: "left",
    color: "white",
    width: `${100 / headers.length + 1}%`,
  }
  const exampleData = data.map((str) => ({
    title: str,
    location: "music/" + str,
  }))
  return (
    <div
      className="SelectSong"
      style={{ padding: "5vh 5vw", display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex" }}>
        <span className="tableHeader" style={{ ...cellStyle }}>
          Title
        </span>
        <input
          className="searchInput"
          placeholder="Search"
          value={search}
          onChange={handleInput}
          type="text"
        />
      </div>
      <div className="tableContent">
        {exampleData
          .filter((song: any) => {
            return search === "" || songContainsWord(song, search)
          })
          .map((song: any) => {
            return (
              <div
                key={song.location}
                className="tableRow"
                onClick={() => {
                  history.push(`/play/${song.location}`)
                }}
              >
                {headers.map((header, i) => {
                  return (
                    <div key={i} style={{ ...cellStyle }}>
                      {song[header.id]}
                    </div>
                  )
                })}
                <div style={{ ...cellStyle }}></div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default SelectSongPage
