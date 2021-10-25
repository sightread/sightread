export type UploadSong = {
  file: File
  name: string
  artist: string
}

export type UploadFormState = {
  file?: File
  name?: string
  artist?: string
  error?: string
}
