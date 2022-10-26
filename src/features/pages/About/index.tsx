import React, { PropsWithChildren, ReactChild } from 'react'
import { AppBar, Sizer } from '@/components'
import { palette } from '@/styles/common'
import Link from 'next/link'
import { Article, CaptionedImage } from './components'
import { slugify } from './utils'

function SidebarLink({ children }: PropsWithChildren<{ children: string }>) {
  return <a href={`#${slugify(children)}`}>{children}</a>
}

export default function AboutPage() {
  return (
    <div className="relative">
      <AppBar style={{ backgroundColor: palette.purple.dark }} />
      <div className="md:bg-[#F7F4FE]">
        <div className="flex max-w-screen-lg mx-auto">
          <div className="hidden md:block sticky top-0 p-8 max-h-screen">
            <section className="flex flex-col mx-auto">
              <h2 className="text-3xl">About</h2>
              <Sizer height={32} />
              <ul className="text-xl flex flex-col gap-5 whitespace-nowrap">
                <li>
                  <SidebarLink>What</SidebarLink>
                </li>
                <li>
                  <SidebarLink>Getting started</SidebarLink>
                </li>
                <li>
                  <SidebarLink>Music selection</SidebarLink>
                </li>
                <li>
                  <SidebarLink>Browser compatibility</SidebarLink>
                </li>
                <li>
                  <SidebarLink>Roadmap</SidebarLink>
                </li>
                <li>
                  <SidebarLink>Feedback</SidebarLink>
                </li>
              </ul>
            </section>
          </div>
          <div className="p-8 mx-auto w-full text-base max-w-prose flex flex-1 flex-col gap-9 bg-white">
            <WhatSection />
            <GettingStarted />
            <MusicSelectionSection />
            <BrowserCompatibilitySection />
            <RoadmapSection />
            <FeedbackSection />
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatSection() {
  return (
    <Article
      header="What"
      first="Sightread is a free and open-source webapp for learning to play Piano."
    >
      <p>
        Sightread is great for beginners – you can play songs without needing to learn sheet music.
        Sightread creates an intuitive <span className="italic">Falling Notes</span> visualization
        of a song, similar to rhythm games like Guitar Hero.
      </p>
      <Sizer height={8} />
      <CaptionedImage
        src="/images/mode_falling_notes_screenshot.png"
        caption="Falling Notes with note labels"
        height={1628}
        width={1636}
      />
      <Sizer height={24} />
      <p>
        For those who want to learn sheet music, Sightread offers Sheet Hero (beta) mode. Sheet Hero
        is a halfway point between the simplicity of falling notes and the full complexity of sheet
        music. Notes are laid out on a musical staff, but timing is simplified. Rather than needing
        to understand beat divisions, Sheet Hero represents the duration of notes with a tail. Key
        signatures are also optional in this mode. Sightread will by default display a song in it’s
        original key, but you may change the key to any that you prefer.
      </p>
      <Sizer height={8} />
      <CaptionedImage
        src="/images/mode_sheet_hero_screenshot.png"
        width={1980}
        height={1148}
        caption="Sheet Hero (beta) with note labels"
      />
    </Article>
  )
}

function GettingStarted() {
  return (
    <Article header="Getting started" first="Plug in a keyboard. Start slow. Gradually speed up.">
      <p>
        When initially learning a song, I recommend learning left and right hands separately. You
        should also take advantage of the BPM modifier to slow down a song by at least 50%. It is
        significantly more helpful to hit the right notes with good form and slowly build up speed
        than to frantically practice at full speed and build bad habits. This is especially true
        when combining hands.
      </p>
      <p>
        If you connect a MIDI keyboard, you can enable <span className="italic">Wait</span> mode –
        the song will wait for you to hit the right key before progressing.
      </p>
      <p>
        Sightread works best in conjunction with a Piano teacher. Falling notes will allow you to
        have more fun with less experience, but it is no replacement for formal education. Learning
        music theory will help you get a more holistic music experience than learning solely
        learning how to play songs.
      </p>
    </Article>
  )
}

function MusicSelectionSection() {
  return (
    <Article
      header="Music selection"
      first="The Sightread catalog has three components: midishare, built-in, and local file uploads."
    >
      <p>
        Sightread includes the midishare catalog, as well as 153 built-in public domain songs
        curated by Synthesia.
      </p>
      <p>
        You can <AboutLink href="https://midishare.com/upload">upload</AboutLink> MIDI files to
        midishare where they’ll be available for the entire community. If you’d prefer to keep them
        local, you can also upload them directly to Sightread which saves them in browser storage.
      </p>
      <p>
        If you can’t find the music you’re looking for on midishare, a Google search is your best
        bet. Or you can send me an{' '}
        <AboutLink href="mailto:midishare.dev@gmail.com">email</AboutLink> and I’ll try to help out.
      </p>
    </Article>
  )
}

function BrowserCompatibilitySection() {
  return (
    <Article
      header="Browser compatibility"
      first="Sightread is fully compatible with the latest versions of Chrome and Firefox."
    >
      <p>
        Apple has not implemented the WebMIDI spec, so plugging in a keyboard will not work in
        Safari. Apple also{' '}
        <AboutLink href="https://css-tricks.com/ios-browser-choice/">restricts</AboutLink> iOS
        devices from using any browser engine but their own. Therefore Sightread has the same
        limitation on iPad and iPhone. In the future, I plan to release a free iOS app to work
        around this limitation.
      </p>
    </Article>
  )
}

function RoadmapSection() {
  return (
    <Article header="Roadmap">
      <p>
        I have so many exciting ideas for where I’d like to take this project, but I have a full
        time job so progress is slow. Things I plan to implement in future releases, in no
        particular order are:
      </p>
      <ul className="px-12 list-disc">
        <li> iOS App </li>
        <li>MusicXML file upload and full Sheet Music display.</li>
        <li>Progress tracking and song scoring to see improvement over time.</li>
        <li>
          Difficulty scaling for algorithmically scaling the difficulty of a song up and down.
        </li>
        <li>Record a performance in free play and share it with a link.</li>
        <li>Small training tools and games.</li>
      </ul>
    </Article>
  )
}

function FeedbackSection() {
  return (
    <Article header="Feedback">
      <p>
        Reach out if you encounter any problems with the site or would like to leave feedback. I’d
        also love to hear about any feature ideas you may have.
      </p>
      <ul className="px-12 list-disc">
        <li>GitHub</li>
        <li>Email: sightreadllc@gmail.com</li>
      </ul>
    </Article>
  )
}

function AboutLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <Link href={href}>
      <a className="text-purple-primary hover:text-purple-hover">{children}</a>
    </Link>
  )
}
