'use client'

import { useEffect, useRef, useState } from 'react'

interface StreamingDisplayProps {
  text: string
  className?: string
  maxHeight?: string
  streamingSpeed?: number // Characters per interval
  streamingInterval?: number // Milliseconds between updates
}

export default function StreamingDisplay({
  text,
  className = '',
  maxHeight = '400px',
  streamingSpeed = 2,
  streamingInterval = 20,
}: StreamingDisplayProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousTextRef = useRef<string>('')

  useEffect(() => {
    // Cleanup previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Reset when text is empty
    if (text === '') {
      setDisplayedText('')
      setIsStreaming(false)
      previousTextRef.current = ''
      return
    }

    // Check if text changed
    const textChanged = text !== previousTextRef.current
    
    if (textChanged) {
      // If text completely changed, restart
      if (text.length < previousTextRef.current.length || 
          !text.startsWith(previousTextRef.current.substring(0, displayedText.length))) {
        setDisplayedText('')
        setIsStreaming(true)
        streamText(text, 0)
      } else if (text.length > displayedText.length) {
        // Continue streaming from current position
        setIsStreaming(true)
        streamText(text, displayedText.length)
      }
      previousTextRef.current = text
    } else if (text.length > displayedText.length) {
      // Same text, continue streaming
      setIsStreaming(true)
      streamText(text, displayedText.length)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [text, streamingSpeed, streamingInterval])

  const streamText = (fullText: string, startIndex: number) => {
    if (startIndex >= fullText.length) {
      setIsStreaming(false)
      return
    }

    const endIndex = Math.min(startIndex + streamingSpeed, fullText.length)
    setDisplayedText(fullText.substring(0, endIndex))

    timeoutRef.current = setTimeout(() => {
      streamText(fullText, endIndex)
    }, streamingInterval)
  }

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedText])

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ maxHeight }}
    >
      <div className="whitespace-pre-wrap break-words">
        {displayedText}
        {isStreaming && (
          <span className="inline-block w-0.5 h-5 bg-gray-900 dark:bg-gray-100 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  )
}
