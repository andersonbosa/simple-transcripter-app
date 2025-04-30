'use client'

import { CaptionsIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { OpenAI } from 'openai'
import { useState } from 'react'

export default function AudioTranscriber() {
    const [apiKey, setApiKey] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [transcript, setTranscript] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const allowedTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/mpga',
        'audio/m4a',
        'audio/wav',
        'audio/webm',
    ]

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0]
        if (!uploadedFile) return
        if (!allowedTypes.includes(uploadedFile.type)) {
            setError('File type not supported.')
            return
        }
        if (uploadedFile.size > 25 * 1024 * 1024) {
            setError('File exceeds 25MB.')
            return
        }
        setError('')
        setFile(uploadedFile)
    }

    const handleUpload = async () => {
        if (!file || !apiKey) {
            setError('Arquivo e API Key são obrigatórios.')
            return
        }

        setLoading(true)
        setTranscript('')
        setError('')

        try {
            // https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
            const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
            const transcription = await client.audio.transcriptions.create({
                file,
                model: "gpt-4o-transcribe",
                response_format: "text",
            })

            setTranscript(transcription)
        } catch (err: any) {
            setError('Error transcribing audio. Check your API Key and try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!transcript) return
        await navigator.clipboard.writeText(transcript)
    }

    const handleDownload = () => {
        const blob = new Blob([transcript], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transcript.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="max-w-xl mx-auto p-4 border rounded-xl shadow-md">
            <div className='flex justify-center items-center gap-2 mb-4'>
                <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2">
                    <CaptionsIcon />
                    STT:Speech To Text
                </h2>
            </div>

            <label className="block mb-2 font-medium">Your OpenAI ApiKey:</label>
            <div className='flex flex-col gap-4 w-full'>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border rounded"
                />
                <p className='text-sm text-gray-500 inline-flex gap-1 mb-4'>
                    Disclaimer: We value your privacy. Your API key is not stored or sent to our servers. It is used solely for processing your requests.
                </p>


                <input
                    type="file"
                    accept={allowedTypes.join(',')}
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded mb-4"
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || !apiKey || loading}
                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-300 justify-end"
                >
                    {loading ? 'Transcribing...' : 'Transcribe'}
                </button>
            </div>

            {transcript && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Result</h3>
                    <textarea
                        className="w-full h-60 p-2 border rounded mb-2"
                        value={transcript}
                        readOnly
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleCopy}
                            className="bg-gray-700 text-white px-3 rounded py-2 flex items-center gap-1"
                        >
                            <CopyIcon /> Copy to clipboard
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-green-600 text-white px-3 rounded py-2 flex items-center gap-1"
                        >
                            <DownloadIcon /> Download transcript
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}