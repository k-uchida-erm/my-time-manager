'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TimeEntry } from '@/lib/types'

interface UseTimelineStateArgs {
  onUpdateEntry?: (entry: TimeEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
}

export function useTimelineState({ onUpdateEntry, onDeleteEntry }: UseTimelineStateArgs) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [scrollTop, setScrollTop] = useState(0)

  // 初期化と現在時刻の更新
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 外側クリックでツールチップを閉じる
  useEffect(() => {
    if (!selectedEntry || !tooltipPosition) return
    const handleClick = (e: MouseEvent) => {
      const tooltip = document.getElementById('timeline-tooltip')
      if (tooltip && tooltip.contains(e.target as Node)) return
      setSelectedEntry(null)
      setTooltipPosition(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectedEntry, tooltipPosition])

  // ズーム変更（現在時刻を中心に保つ）
  const handleZoomChange = useCallback((newZoomLevel: number, container: HTMLDivElement | null) => {
    if (!container || !currentTime) {
      setZoomLevel(newZoomLevel)
      return
    }
    const baseHeight = 500
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    const newCurrentTimePos = (hour + minute / 60) * (baseHeight * newZoomLevel) / 24 + 20
    const containerHeight = container.clientHeight
    const newScrollTop = newCurrentTimePos - containerHeight / 2
    setZoomLevel(newZoomLevel)
    requestAnimationFrame(() => {
      if (container) container.scrollTop = Math.max(0, newScrollTop)
    })
  }, [currentTime, zoomLevel])

  // エントリ選択
  const handleSelectEntry = useCallback((entry: TimeEntry, event: React.MouseEvent, container: HTMLDivElement | null) => {
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null)
      setTooltipPosition(null)
      return
    }
    setSelectedEntry(entry)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = container?.getBoundingClientRect()
    if (containerRect) {
      const left = rect.right - containerRect.left - 40
      const top = rect.top - containerRect.top + (rect.height / 2)
      setTooltipPosition({ top, left })
    }
  }, [selectedEntry])

  const handleEditEntry = useCallback((entry: TimeEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }, [])

  const handleSaveEntry = useCallback((updatedEntry: TimeEntry) => {
    if (onUpdateEntry) onUpdateEntry(updatedEntry)
  }, [onUpdateEntry])

  const handleDeleteEntry = useCallback((entryId: number) => {
    if (onDeleteEntry) onDeleteEntry(entryId)
  }, [onDeleteEntry])

  return {
    // state
    currentTime,
    isClient,
    selectedEntry,
    tooltipPosition,
    isEditModalOpen,
    editingEntry,
    zoomLevel,
    scrollTop,
    // setters/handlers
    setScrollTop,
    setIsEditModalOpen,
    setEditingEntry,
    handleZoomChange,
    handleSelectEntry,
    handleEditEntry,
    handleSaveEntry,
    handleDeleteEntry,
  }
} 