'use client'

import { Sizer } from '@/components'
import { useRefreshStorageMetadata } from '@/features/data/library'
import { savePlaylist, getPlaylistLibrary, deletePlaylist } from '@/features/persist'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Plus } from '@/icons'
import PlayListTable from './PlaylistTable'
import { Playlist } from '@/types'

export default function PlayListView({ onClose }: { onClose: () => void }) {
  const refreshStorage = useRefreshStorageMetadata()
  const [error, setError] = useState<string | null>(null);
  const [playlists, setPlayLists] = useState<Playlist[]>([]);

  useEffect(()=>refreshPlayLists(), []);

  const refreshPlayLists = () => {
    setPlayLists(getPlaylistLibrary());
  };

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target
    if (target.files) {
      try {
        setError(null)
        await savePlaylist(target.files[0]);
        refreshStorage()
        refreshPlayLists()
      } catch (error: any) {
        console.error('Something went wrong', error)
        setError(error.message)
      }
    }
    e.target.value = '';
  }

  const handleDelete = (playlist: Playlist) => {
    if(confirm(`Are you sure you want to delete the playlist ${playlist.name}?`)){
      deletePlaylist(playlist.id)
      refreshStorage()
      refreshPlayLists()
    }
  }

  return (
    <div
      className="relative flex w-[min(100vw,500px)] flex-col gap-5 p-8 text-base"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-3xl font-bold">Playlists</h1>
        <div className='flex-grow'></div>
        <label htmlFor="file" className="self-center">
          <div
            className={clsx(
              'hidden flex-nowrap whitespace-nowrap sm:flex',
              'items-center gap-1 rounded-md px-4 py-2',
              'bg-purple-dark text-white transition hover:bg-purple-hover',
            )}
          >
            <Plus width={20} height={20} />
            <span>Add New</span>
          </div>
        </label>
        <input
          onChange={handleAddFile}
          id="file"
          name="file"
          type="file"
          accept=".m3u8, .m3u"
          className="hidden"
        />
        <div className='w-2'></div>
      </div>
      {error && (
        <>
          <Sizer height={24} />
          <div
            aria-label="Error message"
            className="m-auto max-w-sm border-[#f5c6cb] bg-[#f8d7da] p-6 text-red-900"
          >
            {error}
          </div>
        </>
      )}
      {!playlists.length && (<p>No playlists found</p>)}
      {playlists.map(playlist=>
        (<PlayListTable key={playlist.id} playlist={playlist} onDelete={()=>handleDelete(playlist)}></PlayListTable>)
      )}
    </div>
  )
}
