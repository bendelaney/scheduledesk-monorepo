'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import QuickListLogo from './QuickListLogo';
import type { Mode } from '@/utils/types'
import { formatRequestList, extractAssessors } from '@/utils/requestFormatter'
import { formatJobList, extractSalespeople } from '@/utils/jobFormatter'

declare global {
  interface Window {
    flatpickr: any;
    marked: any;
  }
}

interface Settings {
  sortBy: string
  annual: string
  showDates: boolean
  dateDisplayType: string
  showValue: boolean
  showSalesperson: boolean
  showRangeInfo: boolean
  showTime: boolean
  startDate: string | null
  endDate: string | null
  salespersonFilter: string
  selectedSalespeople: string[]
  dayFilter: string
  selectedDays: string[]
  expandedSections: {
    display: boolean
    sorting: boolean
    visibility: boolean
  }
}

const DEFAULT_SETTINGS: Settings = {
  sortBy: "date",
  annual: "include",
  showDates: false,
  dateDisplayType: "all",
  showValue: false,
  showSalesperson: true,
  showRangeInfo: true,
  showTime: false,
  startDate: null,
  endDate: null,
  salespersonFilter: "all",
  selectedSalespeople: [],
  dayFilter: "all",
  selectedDays: [],
  expandedSections: {
    display: true,
    sorting: true,
    visibility: true
  }
}



///////////////////////////////////////////
// The QuickList Component
///////////////////////////////////////////
export default function QuickList() {
  const [mode, setMode] = useState<Mode>('visits')
  const [showOutput, setShowOutput] = useState(false)
  const [isMarkdownPreviewing, setIsMarkdownPreviewing] = useState(true)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [renderedMarkdown, setRenderedMarkdown] = useState('')
  const [copyMenuOpen, setCopyMenuOpen] = useState(false)
  const [copyButtonState, setCopyButtonState] = useState('default')
  const [filterText, setFilterText] = useState('')
  const [data, setData] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [salespeople, setSalespeople] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const dateRangeRef = useRef<HTMLDivElement>(null)
  const flatpickrInstance = useRef<any>(null)
  const lastFetchRef = useRef<number>(0)

  // Initialize mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('quicklist_mode')
      if (savedMode === 'visits' || savedMode === 'requests') {
        setMode(savedMode as Mode)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Persist mode selection
  useEffect(() => {
    try {
      localStorage.setItem('quicklist_mode', mode)
    } catch (e) {
      // ignore
    }
  }, [mode])

  // Toggle section visibility
  const toggleSection = (section: 'display' | 'sorting' | 'visibility') => {
    const currentExpanded = settings.expandedSections || {
      display: true,
      sorting: true,
      visibility: true
    }

    updateSettings({
      expandedSections: {
        ...currentExpanded,
        [section]: !currentExpanded[section]
      }
    })
  }

  // Load settings when mode changes (separate storage per mode)
  useEffect(() => {
    const savedSettings = loadSettings(mode)
    setSettings(savedSettings)

    // Load saved dates
    if (savedSettings.startDate && savedSettings.endDate) {
      const start = new Date(savedSettings.startDate)
      const end = new Date(savedSettings.endDate)
      setStartDate(start)
      setEndDate(end)
    } else {
      // Set default Sunday-Friday range
      const defaultStart = getNextSunday()
      const defaultEnd = getFollowingFriday(defaultStart)
      setStartDate(defaultStart)
      setEndDate(defaultEnd)
    }
  }, [mode])

  // Sanitize unavailable sort options when in requests mode
  useEffect(() => {
    if (mode === 'requests' && (settings.sortBy === 'value' || settings.sortBy === 'geoCodeThenValue')) {
      updateSettings({ sortBy: 'alphabetical' })
    }
  }, [mode])

  // Initialize flatpickr when dates are set
  useEffect(() => {
    console.log('Flatpickr effect:', { 
      startDate: !!startDate, 
      endDate: !!endDate, 
      windowFlatpickr: !!window.flatpickr, 
      dateRangeRef: !!dateRangeRef.current 
    })
    if (startDate && endDate && window.flatpickr && dateRangeRef.current) {
      console.log('Initializing flatpickr...')
      initializeFlatpickr()
    }
  }, [startDate, endDate])

  // Auto-save settings when they change (per-mode key)
  useEffect(() => {
    if (settings !== DEFAULT_SETTINGS) {
      saveSettings(mode)
    }
  }, [settings, mode])

  const formatAndDisplay = useCallback(() => {
    const formattedMarkdown =
      mode === 'visits'
        ? formatJobList(data, settings, startDate, endDate, 'markdown', filterText)
        : formatRequestList(data, settings, startDate, endDate, 'markdown', filterText)
    setMarkdownOutput(formattedMarkdown)
  }, [data, settings, startDate, endDate, filterText, mode])

  // Auto-format when relevant data changes
  useEffect(() => {
    formatAndDisplay()
  }, [formatAndDisplay])

  // Force re-format when selectedSalespeople changes
  useEffect(() => {
    formatAndDisplay()
  }, [settings.selectedSalespeople, formatAndDisplay])

  // Render markdown when output changes
  useEffect(() => {
    if (window.marked && isMarkdownPreviewing) {
      renderMarkdown()
    }
  }, [markdownOutput, isMarkdownPreviewing])

  const getNextSunday = (): Date => {
    const now = new Date()
    const day = now.getDay()
    let daysUntilSunday = (7 - day) % 7
    if (daysUntilSunday === 0) daysUntilSunday = 7
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + daysUntilSunday)
    nextSunday.setHours(0, 0, 0, 0)
    return nextSunday
  }

  const getFollowingFriday = (fromSunday: Date): Date => {
    const friday = new Date(fromSunday)
    friday.setDate(fromSunday.getDate() + 5)
    friday.setHours(23, 59, 59, 999)
    return friday
  }

  const initializeFlatpickr = () => {
    if (flatpickrInstance.current) {
      flatpickrInstance.current.destroy()
    }

    if (dateRangeRef.current) {
      flatpickrInstance.current = window.flatpickr(dateRangeRef.current, {
      inline: true,
      mode: "range",
      defaultDate: [startDate, endDate],
      onReady: function(_selectedDates: Date[], _dateStr: string, instance: any) {
        // Prevent text selection
        instance.calendarContainer.style.userSelect = 'none'
        
        // Simple drag selection implementation
        let isDragging = false
        let startElement: HTMLElement | null = null
        let currentHoverElement: HTMLElement | null = null
        
        const dayElements = instance.calendarContainer.querySelectorAll('.flatpickr-day:not(.flatpickr-disabled)')
        
        dayElements.forEach((dayEl: HTMLElement) => {
          // Mouse events (existing functionality)
          dayEl.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault()
            isDragging = true
            startElement = dayEl
            currentHoverElement = dayEl
            
            // Simulate the first click on this element
            dayEl.click()
          })
          
          dayEl.addEventListener('mouseenter', () => {
            if (isDragging) {
              currentHoverElement = dayEl
            }
          })
          
          // Touch events for mobile support
          dayEl.addEventListener('touchstart', (e: TouchEvent) => {
            e.preventDefault()
            isDragging = true
            startElement = dayEl
            currentHoverElement = dayEl
            
            // Simulate the first click on this element
            dayEl.click()
          }, { passive: false })
        })
        
        // Track mouse movement to continuously update current element
        instance.calendarContainer.addEventListener('mousemove', (e: MouseEvent) => {
          if (isDragging) {
            // Find which day element is under the mouse
            const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
            if (elementUnderMouse && elementUnderMouse.classList.contains('flatpickr-day') && !elementUnderMouse.classList.contains('flatpickr-disabled')) {
              currentHoverElement = elementUnderMouse
            }
          }
        })
        
        // Track touch movement to continuously update current element
        instance.calendarContainer.addEventListener('touchmove', (e: TouchEvent) => {
          if (isDragging) {
            e.preventDefault()
            // Get the touch point
            const touch = e.touches[0]
            // Find which day element is under the touch
            const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
            if (elementUnderTouch && elementUnderTouch.classList.contains('flatpickr-day') && !elementUnderTouch.classList.contains('flatpickr-disabled')) {
              currentHoverElement = elementUnderTouch
            }
          }
        }, { passive: false })
        
        // Global mouseup to handle drag ending anywhere
        document.addEventListener('mouseup', () => {
          if (isDragging && startElement && currentHoverElement && currentHoverElement !== startElement) {
            // Simulate the second click on the element we're hovering over
            currentHoverElement.click()
          }
          isDragging = false
          startElement = null
          currentHoverElement = null
        })
        
        // Global touchend to handle drag ending anywhere
        document.addEventListener('touchend', () => {
          if (isDragging && startElement && currentHoverElement && currentHoverElement !== startElement) {
            // Simulate the second click on the element we're hovering over
            currentHoverElement.click()
          }
          isDragging = false
          startElement = null
          currentHoverElement = null
        })
      },
      onChange: function(selectedDates: Date[]) {
        console.log('Calendar onChange triggered:', selectedDates)
        if (selectedDates.length === 2) {
          const start = new Date(selectedDates[0])
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(selectedDates[1])
          end.setHours(23, 59, 59, 999)
          
          setStartDate(start)
          setEndDate(end)
          
          // Update settings with new dates
          setSettings(prev => ({
            ...prev,
            startDate: start.toISOString(),
            endDate: end.toISOString()
          }))
          
          console.log('Updated dates from calendar:', { start, end })
          fetchVisits(start, end)
        }
      }
    })
    }
  }

  const saveSettings = (currentMode: Mode) => {
    try {
      const updatedSettings = {
        ...settings,
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
      }
      const key = currentMode === 'visits' ? 'jobberSettings_visits' : 'jobberSettings_requests'
      localStorage.setItem(key, JSON.stringify(updatedSettings))
      console.log('Settings saved:', updatedSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const loadSettings = (currentMode: Mode): Settings => {
    try {
      const key = currentMode === 'visits' ? 'jobberSettings_visits' : 'jobberSettings_requests'
      const savedSettings = localStorage.getItem(key)
      if (savedSettings) return JSON.parse(savedSettings)
      // No saved settings for this mode; set a cheaper default for requests
      if (currentMode === 'requests') {
        return { ...DEFAULT_SETTINGS, showSalesperson: false }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
    return DEFAULT_SETTINGS
  }


  const renderMarkdown = () => {
    if (!window.marked) return

    const markdownedHTML = window.marked.parse(markdownOutput, {
      gfm: true,
      breaks: true
    })
    setRenderedMarkdown(markdownedHTML)
  }

  const fetchVisits = useCallback(async (startDateParam?: Date, endDateParam?: Date) => {
    const start = startDateParam || startDate
    const end = endDateParam || endDate
    
    if (!start || !end) {
      alert("Please select both start and end dates.")
      return
    }

    setIsRefreshing(true)

    // Format dates for API call using UTC to match database format
    const formatUTCDate = (date: Date): string => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Create a new date object for the end date + 1 day using local time
    const endDatePlusOne = new Date(end)
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1)
    endDatePlusOne.setHours(0, 0, 0, 0)

    const startDateStr = formatUTCDate(start)
    const extendedEndDate = formatUTCDate(endDatePlusOne)

    const startParam = startDateStr + "T00:00:00Z"
    const endParam = extendedEndDate + "T00:00:00Z"
  
    try {
      const endpoint = mode === 'visits' ? '/api/visits' : '/api/requests'
      const includeAssignees = mode === 'requests' && (settings.showSalesperson || settings.salespersonFilter === 'showSelected')
      const response = await fetch(
        `${endpoint}?startDate=${encodeURIComponent(startParam)}&endDate=${encodeURIComponent(endParam)}${mode === 'requests' ? `&includeAssignees=${includeAssignees ? '1' : '0'}` : ''}`,
        { headers: { 'Accept': 'application/json' } }
      )

      if (response.status === 401) {
        window.location.href = '/api/auth/jobber'
        return
      }

      if (!response.ok) {
        throw new Error("Network response was not ok.")
      }

      const responseData = await response.json()
      console.log('API Response data:', responseData)
      setData(responseData)
      if (mode === 'visits') {
        const extractedSalespeople = extractSalespeople(responseData)
        setSalespeople(extractedSalespeople)
      } else {
        let extractedAssessors = extractAssessors(responseData)
        // Always include an explicit 'Unassigned' option for Requests mode
        if (!extractedAssessors.includes('Unassigned')) {
          extractedAssessors = [...extractedAssessors, 'Unassigned']
        }
        setSalespeople(extractedAssessors)
      }
      
    } catch (error) {
      console.error("Error fetching visits:", error)
      alert("Error fetching visits. Please try again.")
    } finally {
      setIsRefreshing(false)
      lastFetchRef.current = Date.now()
    }
  }, [startDate, endDate, mode])

  const navigateToPanel = (panelIndex: number) => {
    setShowOutput(panelIndex === 1)
  }

  const toggleMarkdownPreview = () => {
    setIsMarkdownPreviewing(!isMarkdownPreviewing)
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const result = document.execCommand('copy')
        document.body.removeChild(textArea)
        return result
      }
    } catch (err) {
      console.error('Copy failed:', err)
      return false
    }
  }

  const showCopySuccess = () => {
    setCopyButtonState('success')
    setTimeout(() => {
      setCopyButtonState('default')
    }, 1500)
  }

  const handleCopyClick = async (copyType: string) => {
    setCopyMenuOpen(false)
    let success = false
    
    try {
      if (copyType === 'markdown') {
        success = await copyToClipboard(markdownOutput)
        if (success) showCopySuccess()
      } else if (copyType === 'richtext') {
        if (!renderedMarkdown.trim()) {
          alert('Activate preview first.')
          return
        }
        
        // Try selection-based copy for rich text
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = renderedMarkdown
        document.body.appendChild(tempDiv)
        
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(tempDiv.innerText)
            success = true
          } else {
            const range = document.createRange()
            range.selectNodeContents(tempDiv)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
            success = document.execCommand('copy')
            sel?.removeAllRanges()
            
            if (!success) {
              success = await copyToClipboard(tempDiv.innerText)
            }
          }
        } catch (selectionErr) {
          success = await copyToClipboard(tempDiv.innerText)
        } finally {
          document.body.removeChild(tempDiv)
        }
        
        if (success) showCopySuccess()
      } else if (copyType === 'plaintext') {
        if (!data) {
          alert('No data yet.')
          return
        }
        const plain = mode === 'visits'
          ? formatJobList(data, settings, startDate, endDate, 'plaintext', filterText)
          : formatRequestList(data, settings, startDate, endDate, 'plaintext', filterText)
        success = await copyToClipboard(plain)
        if (success) showCopySuccess()
      }
      
      if (!success) {
        alert('Copy failed. Try selecting the text manually and using Ctrl+C (or Cmd+C on Mac).')
      }
      
    } catch (e) {
      console.error('Copy operation failed:', e)
      alert('Copy failed. Try selecting the text manually and using Ctrl+C (or Cmd+C on Mac).')
    }
  }

  const handleRefresh = () => {
    fetchVisits()
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  // Handle clicking outside copy menu to close it
  useEffect(() => {
    const handleClickOutside = () => {
      if (copyMenuOpen) {
        setCopyMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [copyMenuOpen])

  // Fetch data when dates or mode are available/changed
  useEffect(() => {
    if (startDate && endDate) {
      setTimeout(() => {
        fetchVisits()
      }, 100)
    }
  }, [startDate, endDate, mode])

  // Intercept outgoing links to open in new windows
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.startsWith(window.location.origin)) {
        // Don't prevent default - let the browser handle external links naturally
        // Just ensure target="_blank" for better mobile experience
        if (!link.target) {
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
        }
      }
    }

    document.addEventListener('click', handleLinkClick, { passive: true })
    return () => document.removeEventListener('click', handleLinkClick)
  }, [])

  // Refresh data when window regains focus (cooldown to reduce API calls)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (Date.now() - lastFetchRef.current > 10000) {
        fetchVisits()
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => window.removeEventListener('focus', handleWindowFocus)
  }, [fetchVisits])


  return (
    <>
      
      <div id="wrapper" className={showOutput ? 'show-output' : ''}>
        <div id="sidebar">
          <header>
            <h1 aria-label="QuickList, for Jobber">
              <QuickListLogo />
              <span>for Jobber</span>
            </h1>
            <div className="mode-tabs">
              <button
                className={`button ${mode === 'visits' ? 'active' : ''}`}
                onClick={() => setMode('visits')}
                aria-pressed={mode === 'visits'}
                title="Show Job Visits"
              >
                Visits
              </button>
              <button
                className={`button ${mode === 'requests' ? 'active' : ''}`}
                onClick={() => setMode('requests')}
                aria-pressed={mode === 'requests'}
                title="Show Requests (Assessment Visits)"
              >
                Requests
              </button>
            </div>
          </header>

          <div id="optionsContainer">
            <div className="calendar-container">
              <div ref={dateRangeRef} id="dateRangeCalendar"></div>
            </div>

            <div className="input-group display">
              <h4 className="section-header" onClick={() => toggleSection('display')}>
                <span className={`caret ${settings.expandedSections?.display !== false ? 'expanded' : ''}`}>▼</span>
                Display Options
              </h4>
              {settings.expandedSections?.display !== false && (
                <div className="section-content">
                  <p>
                <input
                  type="checkbox"
                  id="showDatesCheckbox"
                  checked={settings.showDates}
                  onChange={(e) => updateSettings({ showDates: e.target.checked })}
                />
                <label htmlFor="showDatesCheckbox">Dates</label>
              </p>
              
              {settings.showDates && (
                <div id="dateOptionsContainer" className="date-options">
                  <p>
                    <input
                      type="radio"
                      id="showDatesAll"
                      name="dateDisplay"
                      value="all"
                      checked={settings.dateDisplayType === 'all'}
                      onChange={(e) => updateSettings({ dateDisplayType: e.target.value })}
                    />
                    <label htmlFor="showDatesAll">All Dates</label>
                  </p>
                  <p>
                    <input
                      type="radio"
                      id="showDatesWeekdayOnly"
                      name="dateDisplay"
                      value="weekdayOnly"
                      checked={settings.dateDisplayType === 'weekdayOnly'}
                      onChange={(e) => updateSettings({ dateDisplayType: e.target.value })}
                    />
                    <label htmlFor="showDatesWeekdayOnly">Only Weekdays</label>
                  </p>
                  <p>
                    <input
                      type="radio"
                      id="showDatesWeekendOnly"
                      name="dateDisplay"
                      value="weekendOnly"
                      checked={settings.dateDisplayType === 'weekendOnly'}
                      onChange={(e) => updateSettings({ dateDisplayType: e.target.value })}
                    />
                    <label htmlFor="showDatesWeekendOnly">Only Weekends</label>
                  </p>
                </div>
              )}
              
              <p>
                <input
                  type="checkbox"
                  id="showTimeCheckbox"
                  checked={settings.showTime}
                  onChange={(e) => updateSettings({ showTime: e.target.checked })}
                />
                <label htmlFor="showTimeCheckbox">Times</label>
              </p>
              {mode === 'visits' && (
                <p>
                  <input
                    type="checkbox"
                    id="showValueCheckbox"
                    checked={settings.showValue}
                    onChange={(e) => updateSettings({ showValue: e.target.checked })}
                  />
                  <label htmlFor="showValueCheckbox">$ Value</label>
                </p>
              )}
              <p>
                <input
                  type="checkbox"
                  id="showSalespersonCheckbox"
                  checked={settings.showSalesperson}
                  onChange={(e) => updateSettings({ showSalesperson: e.target.checked })}
                />
                <label htmlFor="showSalespersonCheckbox">{mode === 'visits' ? 'Salesperson' : 'Estimator'}</label>
              </p>
              <p>
                <input
                  type="checkbox"
                  id="showRangeInfoCheckbox"
                  checked={settings.showRangeInfo}
                  onChange={(e) => updateSettings({ showRangeInfo: e.target.checked })}
                />
                <label htmlFor="showRangeInfoCheckbox">List Summary Title</label>
                  </p>
                </div>
              )}
            </div>

            <div className="input-group sorting">
              <h4 className="section-header" onClick={() => toggleSection('sorting')}>
                <span className={`caret ${settings.expandedSections?.sorting !== false ? 'expanded' : ''}`}>▼</span>
                Sorting
              </h4>
              {settings.expandedSections?.sorting !== false && (
                <div className="section-content">
                  <p>
                <label htmlFor="sortBySelect">Sort by:</label>
                <select
                  id="sortBySelect"
                  value={settings.sortBy}
                  onChange={(e) => updateSettings({ sortBy: e.target.value })}
                >
                  <option value="date">Date</option>
                  <option value="alphabetical">Alphabetical</option>
                  {mode === 'visits' && <option value="value">$ Value</option>}
                  <option value="geoCode">GeoCode</option>
                  {mode === 'visits' && <option value="geoCodeThenValue">GeoCode, then $ Value</option>}
                  <option value="salesperson">{mode === 'visits' ? 'Salesperson' : 'Estimator'}</option>
                </select>
                  </p>
                </div>
              )}
            </div>

            <div className="input-group visibility">
              <h4 className="section-header" onClick={() => toggleSection('visibility')}>
                <span className={`caret ${settings.expandedSections?.visibility !== false ? 'expanded' : ''}`}>▼</span>
                Inclusion
              </h4>
              {settings.expandedSections?.visibility !== false && (
              <div className="section-content">
                {mode === 'visits' && (
                  <p>
                    <label htmlFor="annualSelect">Annual Jobs:</label>
                    <select
                      id="annualSelect"
                      value={settings.annual}
                      onChange={(e) => updateSettings({ annual: e.target.value })}
                    >
                      <option value="include">Include Annual Jobs</option>
                      <option value="exclude">Exclude Annual Jobs</option>
                      <option value="excludeUnconfirmed">Exclude Unconfirmed Annual Jobs</option>
                      <option value="annualOnly">Show Only Annual Jobs</option>
                      <option value="annualOnlyConfirmed">Show Only *Confirmed* Annual Jobs</option>
                      <option value="annualOnlyUnconfirmed">Show Only *Unconfirmed* Annual Jobs</option>
                    </select>
                  </p>
                )}
                <p>
                  <label htmlFor="salespersonFilterSelect">{mode === 'visits' ? 'Salesperson' : 'Estimator'}:</label>
                  <select
                    id="salespersonFilterSelect"
                    value={settings.salespersonFilter}
                    onChange={(e) => updateSettings({ salespersonFilter: e.target.value })}
                  >
                    <option value="all">Include All</option>
                    <option value="showSelected">Include Selected...</option>
                  </select>
                </p>

                {settings.salespersonFilter === 'showSelected' && (
                <div id="salespersonCheckboxes" className="salesperson-checkboxes salesperson-checkboxes-visible">
                  <p className="salesperson-select-all">
                    <input
                      type="checkbox"
                      id="salesperson_all"
                      checked={salespeople.length > 0 && salespeople.every(sp => 
                        settings.selectedSalespeople.includes(sp)
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateSettings({ selectedSalespeople: [...salespeople] })
                        } else {
                          updateSettings({ selectedSalespeople: [] })
                        }
                      }}
                    />
                    <label htmlFor="salesperson_all" className="salesperson-select-all-label">
                      Select All:
                    </label>
                  </p>
                  {salespeople.map(salesperson => (
                    <p key={salesperson} className="salesperson-item">
                      <input
                        type="checkbox"
                        id={`salesperson_${salesperson.replace(/[^a-zA-Z0-9]/g, '_')}`}
                        checked={settings.selectedSalespeople.includes(salesperson)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateSettings({
                              selectedSalespeople: [...settings.selectedSalespeople, salesperson]
                            })
                          } else {
                            updateSettings({
                              selectedSalespeople: settings.selectedSalespeople.filter(sp => sp !== salesperson)
                            })
                          }
                        }}
                      />
                      <label htmlFor={`salesperson_${salesperson.replace(/[^a-zA-Z0-9]/g, '_')}`}>
                        {salesperson}
                      </label>
                    </p>
                  ))}
                </div>
                )}

                <p>
                  <label htmlFor="dayFilterSelect">Days:</label>
                  <select
                    id="dayFilterSelect"
                    value={settings.dayFilter}
                    onChange={(e) => updateSettings({ dayFilter: e.target.value })}
                  >
                    <option value="all">Include All Days</option>
                    <option value="showSelected">Include Selected...</option>
                  </select>
                </p>

                {settings.dayFilter === 'showSelected' && (
                <div id="dayCheckboxes" className="salesperson-checkboxes salesperson-checkboxes-visible">
                  <p className="salesperson-select-all">
                    <input
                      type="checkbox"
                      id="day_all"
                      checked={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].every(day => 
                        settings.selectedDays?.includes(day)
                      )}
                      onChange={(e) => {
                        const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        if (e.target.checked) {
                          updateSettings({ selectedDays: [...allDays] })
                        } else {
                          updateSettings({ selectedDays: [] })
                        }
                      }}
                    />
                    <label htmlFor="day_all" className="salesperson-select-all-label">
                      Select All:
                    </label>
                  </p>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <p key={day} className="salesperson-item">
                      <input
                        type="checkbox"
                        id={`day_${day}`}
                        checked={settings.selectedDays?.includes(day) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateSettings({
                              selectedDays: [...(settings.selectedDays || []), day]
                            })
                          } else {
                            updateSettings({
                              selectedDays: (settings.selectedDays || []).filter(d => d !== day)
                            })
                          }
                        }}
                      />
                      <label htmlFor={`day_${day}`}>
                        {day}
                      </label>
                    </p>
                  ))}
                </div>
                )}

                </div>
              )}
            </div>

            <p>
              <button 
                id="refreshDataBtn" 
                className={`button active ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </p>
          </div>
        </div>

        <div id="outputContainer">
          <div className="button-bar">
            <input
              type="text"
              id="filterInput"
              placeholder="Filter by..."
              className="filter-input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button
              id="previewMarkdownBtn"
              className={`preview-button button ${isMarkdownPreviewing ? 'active' : ''}`}
              title="Preview Markdown"
              onClick={toggleMarkdownPreview}
            >
              M
            </button>
            <div className="copy-dropdown-container">
              <button
                className={`copy-dropdown-trigger ${copyButtonState === 'success' ? 'success' : ''} ${copyMenuOpen ? 'menu-open' : ''}`}
                id="copyDropdownTrigger"
                onClick={(e) => {
                  e.stopPropagation()
                  if (copyButtonState === 'default') {
                    setCopyMenuOpen(!copyMenuOpen)
                  }
                }}
              >
                {copyButtonState === 'success' ? '👍 Copied!' : 'Copy List as...'}
              </button>
              <div 
                className={`copy-dropdown-menu ${copyMenuOpen ? 'show' : ''}`} 
                id="copyDropdownMenu"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="copy-dropdown-item" 
                  onClick={() => handleCopyClick('markdown')}
                >
                  Markdown
                </button>
                <button 
                  className="copy-dropdown-item" 
                  onClick={() => handleCopyClick('richtext')}
                >
                  Rich Text
                </button>
                <button 
                  className="copy-dropdown-item" 
                  onClick={() => handleCopyClick('plaintext')}
                >
                  Plain Text
                </button>
              </div>
            </div>
          </div>
          
          <textarea
            id="markdown-output"
            className={`output ${isMarkdownPreviewing ? 'output-hidden' : 'output-visible'}`}
            placeholder="Your Markdown will go here."
            value={markdownOutput}
            onChange={(e) => setMarkdownOutput(e.target.value)}
          />
          
          <div
            id="renderedMarkdown"
            className={`rendered-markdown ${isMarkdownPreviewing ? 'rendered-markdown-visible' : 'rendered-markdown-hidden'}`}
            dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
          />
        </div>
      </div>

      {/* Mobile navigation buttons */}
      <button
        id="viewListBtn"
        className={`mobile-nav-button ${showOutput ? 'mobile-nav-button-hidden' : 'mobile-nav-button-visible'}`}
        onClick={() => navigateToPanel(1)}
      >
        View List 👉🏼
      </button>
      <button
        id="optionsBtn"
        className={`mobile-nav-button ${showOutput ? 'mobile-nav-button-visible' : 'mobile-nav-button-hidden'}`}
        onClick={() => navigateToPanel(0)}
      >
        👈🏼 Options
      </button>
    </>
  )
}