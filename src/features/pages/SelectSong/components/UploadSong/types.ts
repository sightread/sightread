export type UploadSong = {
  file: File
  title: string
  artist: string
}

export type UploadFormState = {
  file?: File
  title?: string
  artist?: string
  error?: string
  source: 'upload'
}
