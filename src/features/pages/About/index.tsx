import React, { PropsWithChildren, ReactChild } from 'react'
import { AppBar, Sizer } from '@/components'
import { palette } from '@/styles/common'
import Link from 'next/link'

type ArticleContent = { heading: string; first?: string; body: ReactChild[] }
const textArticles: ArticleContent[] = [
  {
    heading: 'What',
    first: 'Sightread is a free and open-source webapp for Piano education.',
    body: [
      <p key="what-1">
        Sightread will help you learn piano. It is great for beginners because you can play songs
        without needing to learn sheet music. The featureset in this original release is heavily
        inspired by Synthesia, with the key difference that Sightread is free and browser based.
      </p>,
      <p key="what-2">
        Sightread’s goal is to help piano students learn sheet music, and eventually, how to
        sightread. While the only completed visualizer is Falling Notes, we have a new Beta mode
        called Sheet Hero which is an attempt to offer a halfway point between the simplicity of
        falling notes and the full complexity of sheet music.
      </p>,
      <p key="what-3">
        Sightread works best in conjunction with a Piano teacher. Falling notes will allow you to
        have more fun with less experience, but it is no replacement for formal education. Learning
        music theory will help you get a more holistic music experience than learning solely
        learning how to play songs.`,
      </p>,
    ],
  },
  {
    heading: 'How',
    first: 'Falling notes, (Beta) Sheet Hero, and eventually a suite of learning tools',
    body: [
      <p key="how-1">
        Sightread comes with a host of features designed to help you learn. The primary flow is to
        select a song and play it in the Falling Notes visualization mode.
      </p>,
      <p key="how-2">
        If you are able to connect a MIDI keyboard to your device, you can use Wait mode which will
        wait for you to hit the right note before progressing.
      </p>,
      <p key="how-3">
        When initially learning a song you should start with learning the hands separately. You
        should also take advantage of the BPM modifier to slow down a song by at least 50%. It is
        significantly more helpful to hit the right notes with good form and slowly build up speed
        than to frantically practice at full speed and build bad habits.
      </p>,
    ],
  },
  {
    heading: 'Music selection',
    first:
      'The Sightread catalog has three components: built in, midishare, and local file uploads',
    body: [
      <p key="music-p1">
        Sightread comes with a selection of 153 songs built-in. The song selection was taken from
        Synthesia and is exclusively composed of works from the public domain. See the full list
        here.
      </p>,
      <p key="music-p2">
        Sightread also includes all of the free MIDI music available on midishare. If there is music
        not on midishare that you’d like to learn, your best bet is a Google search for a relevant
        MIDI file. If you cannot find the music you are looking for, please send an email to
        midishare.dev@gmail.com and I’ll try to help out.
      </p>,
      <p key="music-p3">
        Lastly, if you have your own MIDI files that you’d like to use to learn or practice, you may
        upload them to Sightread which stores them locally on your browser, or upload them to
        midishare and they’ll be available for anyone using Sightread.
      </p>,
    ],
  },
  {
    heading: 'Browser Compatibility',
    first: 'Sightread is fully compatible with the latest versions of Chrome and Firefox.',
    body: [
      <p key="bcompat-1">
        Apple has not implemented the WebMIDI spec, so plugging in a keyboard will not work in
        Safari. In addition, Apple{' '}
        <AboutLink href="https://css-tricks.com/ios-browser-choice/">
          restricts iOS devices
        </AboutLink>{' '}
        from using any browser engine but their own. Therefore Sightread has the same limitation on
        iPad and iPhone. In the future, I plan to release a free iOS app to work around this
        limitation.
      </p>,
    ],
  },
  {
    heading: 'Roadmap',
    body: [
      <p key="roadmap-1">
        I have so many exciting ideas for where I’d like to take this project, but (un)fortunately I
        have a full-time job and not enough time to implement them. Things I plan to implement in
        future releases, in no particular order are:
      </p>,
    ],
  },
  {
    heading: 'Feedback',
    body: [
      <p key="feedback-1">
        Please reach out if you encounter any problems with the site or would like to leave
        feedback. I’d also love to hear about any feature ideas you may have.
      </p>,
    ],
  },
]

export default function AboutPage() {
  const articles = textArticles.map((a) => (
    <Article header={a.heading} key={`article-${a.heading}`} first={a.first}>
      {a.body}
    </Article>
  ))

  return (
    <div className="relative">
      <AppBar style={{ backgroundColor: palette.purple.primary }} />
      <Sizer height={48} />
      <div className="px-8 pb-8 mx-auto w-full text-base max-w-prose flex flex-col gap-9">
        {articles}
      </div>
    </div>
  )
}

function AboutLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <Link href={href}>
      <a className="text-purple-primary hover:text-purple-hover">{children}</a>
    </Link>
  )
}

function Article({
  children,
  header,
  first,
}: PropsWithChildren<{ header: string; first?: string | null }>) {
  return (
    <article>
      <h1 className="text-3xl font-bold">{header}</h1>
      <Sizer height={8} />
      <div aria-hidden className="h-full border-purple-primary border" />
      <Sizer height={16} />
      {first && (
        <>
          <h2 className="font-extrabold text-lg">{first}</h2>
          <Sizer height={16} />
        </>
      )}
      <div className="flex flex-col gap-3">{children}</div>
    </article>
  )
}
