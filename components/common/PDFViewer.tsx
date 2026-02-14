"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"


// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
    url: string
}

export default function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [containerWidth, setContainerWidth] = useState<number>(0)
    const containerRef = useRef<HTMLDivElement>(null)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    // Handle resizing to fit width
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width)
            }
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <div className="flex flex-col items-center bg-neutral-900 rounded-b-lg p-4" ref={containerRef}>
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col items-center"
                loading={
                    <div className="flex items-center justify-center h-96 text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                }
                error={
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                        Error al cargar el PDF. Por favor intenta descargarlo.
                    </div>
                }
            >
                {/* Render the current page */}
                <Page
                    pageNumber={pageNumber}
                    width={containerWidth ? Math.min(containerWidth, 1200) : undefined}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="mb-4 shadow-lg"
                />
            </Document>

            {/* Controls */}
            {numPages > 0 && (
                <div className="flex items-center gap-4 mt-4 bg-black/50 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <button
                        onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50 transition-colors text-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    <span className="text-sm font-medium text-white">
                        Página {pageNumber} de {numPages}
                    </span>

                    <button
                        onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50 transition-colors text-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}
