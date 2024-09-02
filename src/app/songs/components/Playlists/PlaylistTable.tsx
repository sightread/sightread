import { Playlist, SongMetadata } from "@/types";
import { Trash, ChevronRight, ChevronDown } from '@/icons'
import clsx from 'clsx'
import { formatTime } from '@/utils'
import { Table } from '../../components'
import './style.css';

export default function PlayListTable({ playlist, onDelete }: { playlist: Playlist, onDelete: ()=> void }) {
    return <details>
        <summary className="mx-auto flex flex-grow">
        <ChevronRight width={20} height={20} className="self-center details-mark-close"/>
        <ChevronDown width={20} height={20} className="self-center details-mark-open"/>
            <h2 className="flex-grow self-center fontleading-6 flex gap-2 whitespace-nowrap text-base font-medium text-foreground">{playlist.name}</h2>
            <button className={clsx(
                'hidden flex-nowrap whitespace-nowrap sm:flex',
                'items-center gap-1 rounded-md px-4 py-2',
                'bg-purple-dark text-white transition hover:bg-purple-hover',
            )}
            type="button"
            onClick={(e)=>{
                e.preventDefault()
                e.stopPropagation()
                onDelete()
            }}
            >
                <Trash width={20} height={20} />
            </button>
        </summary>
        <div className="mx-auto flex w-full max-w-screen-lg flex-grow flex-col p-2 min-h-40">
        <Table
            columns={[
            { label: 'Title', id: 'title', keep: true },
            {
                label: 'Length',
                id: 'duration',
                format: (n) => formatTime(Number(n)),
            }
            ]}
            getId={(s: SongMetadata) => s.id}
            rows={playlist.songs}
            onSelectRow={()=>{}}
            search={''}
            filter={['title', 'artist']}
        />
        {
            !playlist.songs.length && (<p>No songs on playlist</p>)
        }
        </div>

    </details>
}