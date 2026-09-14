"use client"

import { useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { toast as sonner } from "sonner"

export function useBarcodeScanner(onDetected: (value: string) => void) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const readerRef = useRef<BrowserMultiFormatReader | null>(null)

    const startScanner = async () => {
        if (!videoRef.current) return

        readerRef.current = new BrowserMultiFormatReader()

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            })

            streamRef.current = stream
            videoRef.current.srcObject = stream
            videoRef.current.setAttribute("playsinline", "true")
            await videoRef.current.play()

            sonner.success("Camera activated — ready to scan")

            const controls = await readerRef.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        onDetected(result.getText())
                        controls.stop()
                        sonner.success("Code detected and scanning stopped")
                        sonner.info(`Scanned code: ${result.getText()}`)
                    }
                }
            )
        } catch (err) {
            console.error("Error accessing camera:", err)
            sonner.error("Unable to access camera. Please check permissions.")
        }
    }

    const stopScanner = () => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.srcObject = null
        }

        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null

        sonner.success("Camera stopped and scanner deactivated")
    }

    return {
        videoRef,
        startScanner,
        stopScanner
    }
}
