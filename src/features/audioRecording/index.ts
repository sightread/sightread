import { getAudioContext, setRecordingDestinationNode } from '@/features/synth/utils'

let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];

export function startRecordingAudio(): boolean {
    const audioContext = getAudioContext();
    const isAble = audioContext != null;

    if (isAble) {
        const recordingDestinationNode = audioContext.createMediaStreamDestination();
        setRecordingDestinationNode(recordingDestinationNode);
        mediaRecorder = new MediaRecorder(recordingDestinationNode.stream, {mimeType: 'audio/webm'});
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
                const mimeType = audioChunks[0].type;
                const audioBlob = new Blob(audioChunks, {type: mimeType});
                promptDownloadAudioFile(audioBlob, "Piano-Audio.webm", false);
            }
        };

        mediaRecorder.onerror = (error) => {
            console.error('MediaRecorder error:', error);
        };

        mediaRecorder.start();
    }

    return isAble;
}

export function stopRecordingAudio(): boolean {
    const isAble = mediaRecorder && mediaRecorder.state !== 'inactive';
    if (isAble) {
        mediaRecorder.stop();
    }

    return isAble;
}

function promptDownloadAudioFile(blob: Blob, defaultFileName: string, customName: boolean) {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);

    const url = window.URL.createObjectURL(blob);
    a.href = url;

    let fileName: string | null = defaultFileName;
    // This code blocks the page, TODO: Make a save as... window
    if (customName) fileName = prompt("Enter a filename:", defaultFileName);
    if (fileName) {
        a.download = fileName;
        a.click();
    }

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
