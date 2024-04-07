import React, { PropsWithChildren } from 'react'
import { AppBar, Sizer } from '@/components'
import Link from 'next/link'
import { Article, CaptionedImage } from './components'
import { slugify } from './utils'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sightread: About',
}

function SidebarLink({ children }: PropsWithChildren<{ children: string }>) {
  return (
    <a className="hover:text-purple-hover" href={`#${slugify(children)}`}>
      {children}
    </a>
  )
}

export default function AboutPage() {
  return (
    <>
      <div className="relative">
        <AppBar />
        <div className="md:bg-purple-lightest">
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
                  <li>
                    <SidebarLink>Product recommendations</SidebarLink>
                  </li>
                </ul>
              </section>
            </div>
            <div className="my-8 p-8 mx-auto w-full text-base flex-1 bg-white">
              <div className="max-w-prose flex flex-col gap-12 mx-auto">
                <WhatSection />
                <GettingStarted />
                <MusicSelectionSection />
                <BrowserCompatibilitySection />
                <RoadmapSection />
                <FeedbackSection />
                <ProductRecommendations />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
        For those who want to learn sheet music, Sightread offers{' '}
        <span className="italic">Sheet Hero (beta)</span> mode. Sheet Hero is a halfway point
        between the simplicity of falling notes and the full complexity of sheet music. Notes are
        laid out on a musical staff, but timing is simplified. Sheet Hero represents the duration of
        notes with a tail instead of beat denominations. Key signatures are also optional in this
        mode. Sightread will by default display a song in it’s original key, but you may change the
        key to any that you prefer.
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
        When initially learning a song, we recommend learning left and right hands separately. You
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
      first="The Sightread catalog has three components: midishare, builtin, and local file uploads."
    >
      <p>
        Sightread includes works from <AboutLink href="https://midishare.dev">midishare</AboutLink>,
        as well as builtin music from the public domain.
      </p>
      <p>
        You can <AboutLink href="https://midishare.com/upload">upload</AboutLink> MIDI files to
        midishare where they’ll be available for the entire community. If you’d prefer to keep them
        local, you can also upload them directly to Sightread which saves them in browser storage.
      </p>
      <p>
        If you can’t find the music you’re looking for on midishare, a Google search is your best
        bet. Or you can send me an <AboutLink href="mailto:sightreadllc@gmail.com">email</AboutLink>{' '}
        and I’ll try to help out.
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
        Plugging in a MIDI keyboard will not work on iOS or Safari. This is because Apple has not
        implemented the WebMIDI spec and also{' '}
        <AboutLink href="https://css-tricks.com/ios-browser-choice/">restricts</AboutLink> iOS
        devices from using any browser engine but their own.
      </p>
    </Article>
  )
}

function RoadmapSection() {
  return (
    <Article header="Roadmap">
      <p>
        We have so many exciting ideas, but we have full time jobs so progress is slow. Things we
        plan to implement in future releases:
      </p>
      <ul className="px-12 list-disc">
        <li>iOS App</li>
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
        Found a bug or have a feature request? Please file an issue on{' '}
        <AboutLink href="https://github.com/sightread/sightread/issues">GitHub</AboutLink> or send
        an <AboutLink href="mailto:sightreadllc@gmail.com">email</AboutLink>.
      </p>
    </Article>
  )
}

function ProductRecommendations() {
  return (
    <Article
      header="Product recommendations"
      first="Looking for a Sightread-compatible keyboard? We've got you covered."
    >
      <p>
        Sightread needs a keyboard with MIDI-out, usually via USB or Bluetooth. We recommend opting
        for USB connection because Sightread is latency-sensitive.
      </p>

      <ol className="list-disc ml-8">
        <li>
          <b>Beginner:</b> The{' '}
          <AboutLink href="https://www.amazon.com/Casio-61-Key-Portable-Keyboard-LK-S250/dp/B07WK7F7BF?ref_=ast_sto_dp&amp;th=1&_encoding=UTF8&tag=sightread-20&linkCode=ur2&linkId=19d0e41a202a32254091e6bafcae1b13&camp=1789&creative=9325">
            Casio Casiotone LK-S250
          </AboutLink>{' '}
          has 66 light-up keys which can aid learning.
        </li>
        <li>
          <b>Intermediate:</b> The{' '}
          <AboutLink href="https://www.amazon.com/Roland-keys-Digital-Piano-GO-88P/dp/B07M9WFSTK?th=1&_encoding=UTF8&tag=sightread-20&linkCode=ur2&linkId=1318072a32a3ea63d98c4567c2ed3098&camp=1789&creative=9325">
            Roland GO:Piano
          </AboutLink>{' '}
          has a full range of 88 keys with both Bluetooth and USB connections. It has excellent
          sound quality and is the keyboard we use ourselves.
        </li>
      </ol>

      <p>
        These are affiliate links, so we earn from purchases. This is our only form of monetization.
      </p>
    </Article>
  )
}

function AboutLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <Link href={href} className="text-purple-primary hover:text-purple-hover">
      {children}
    </Link>
  )
}
