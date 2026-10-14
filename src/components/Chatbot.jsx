import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chat, Close, Send, SmartToy, Person, TipsAndUpdates, RestartAlt, Mic, MicOff, VolumeUp } from '@mui/icons-material'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'

const SUGGESTIONS = {
  en: [
    'Which district has highest dengue risk?',
    'Show malaria trend',
    'Predict next 7 days',
    'What are dengue symptoms?',
    'Recommend food for fever',
  ],
  hi: [
    'कौन से जिले में डेंगू का सबसे अधिक जोखिम है?',
    'मलेरिया की प्रवृत्ति दिखाएं',
    'अगले 7 दिनों का पूर्वानुमान',
    'डेंगू के लक्षण क्या हैं?',
    'बुखार के लिए खाना सुझाएं',
  ],
  kn: [
    'ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿ ಡೆಂಗ್ಯೂ ಅತಿ ಹೆಚ್ಚು ಅಪಾಯ?',
    'ಮಲೇರಿಯಾ ಪ್ರವೃತ್ತಿ ತೋರಿಸಿ',
    'ಮುಂದಿನ 7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ',
    'ಡೆಂಗ್ಯೂ ರೋಗಲಕ್ಷಣಗಳು ಯಾವುವು?',
    'ಜ್ವರಕ್ಕೆ ಆಹಾರ ಶಿಫಾರಸು',
  ]
}

export default function Chatbot() {
  const { lang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: t('chat.welcome'),
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [speechError, setSpeechError] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const sendMessageDirectRef = useRef(null)
  const listenTimeoutRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  // Keep a stable ref to sendMessageDirect to avoid stale closure
  useEffect(() => {
    sendMessageDirectRef.current = sendMessageDirect
  })

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      setSpeechSupported(true)
      const recognition = new SR()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-US'

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript = transcript
          } else {
            interimTranscript = transcript
          }
        }
        // Show live transcript in input field
        const currentText = finalTranscript || interimTranscript
        if (currentText) {
          setInput(currentText)
          setSpeechError('')
        }
        // Auto-send when final result arrives
        if (finalTranscript) {
          setIsListening(false)
          clearTimeout(listenTimeoutRef.current)
          setTimeout(() => {
            sendMessageDirectRef.current?.(finalTranscript)
          }, 400)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        clearTimeout(listenTimeoutRef.current)
        if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please try again.')
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone access denied. Please allow microphone in browser settings.')
        } else if (event.error === 'network') {
          setSpeechError('Network error. Speech recognition requires internet.')
        } else if (event.error === 'aborted') {
          setSpeechError('')
        } else {
          setSpeechError(`Speech error: ${event.error}. Please try again.`)
        }
        // Clear error after 4 seconds
        setTimeout(() => setSpeechError(''), 4000)
      }

      recognition.onend = () => {
        setIsListening(false)
        clearTimeout(listenTimeoutRef.current)
      }

      recognitionRef.current = recognition
    }
    return () => {
      clearTimeout(listenTimeoutRef.current)
    }
  }, [lang])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === 'welcome' ? { ...m, text: t('chat.welcome') } : m
    ))
  }, [lang, t])

  const speakText = useCallback((text, msgId) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[•\n]/g, ' ').replace(/[^\w\s.,!?()-]/g, ''))
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-US'
    utterance.rate = 0.9
    utterance.onstart = () => setSpeakingId(msgId)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    synthRef.current.speak(utterance)
  }, [lang])

  const stopSpeaking = () => {
    synthRef.current?.cancel()
    setSpeakingId(null)
  }

  const toggleMic = () => {
    if (!recognitionRef.current) return
    setSpeechError('')
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      clearTimeout(listenTimeoutRef.current)
    } else {
      stopSpeaking()
      setInput('')
      try {
        recognitionRef.current.start()
        setIsListening(true)
        // Auto-stop after 15 seconds if no speech
        listenTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
          }
        }, 15000)
      } catch (err) {
        console.error('Mic start error:', err)
        setSpeechError('Could not start microphone. Please try again.')
        setTimeout(() => setSpeechError(''), 3000)
      }
    }
  }

  const sendMessageDirect = async (text) => {
    if (!text?.trim()) return
    const userMessage = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const res = await api.post('/api/chatbot/message', { message: text.trim() })
      const botReply = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.reply,
        timestamp: new Date(),
        confidence: res.data.confidence,
        suggestions: res.data.suggestions
      }
      setMessages(prev => [...prev, botReply])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again or call Health Helpline: 104",
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const sendMessage = async (text) => {
    sendMessageDirect(text || input.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    stopSpeaking()
    setMessages([{
      id: 'welcome_' + Date.now(),
      role: 'bot',
      text: t('chat.welcome'),
      timestamp: new Date()
    }])
  }

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          isOpen ? 'bg-red-500 hover:bg-red-600 rotate-0' : 'gradient-primary hover:shadow-blue-500/30 hover:scale-110'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <Close className="text-white text-2xl" /> : <Chat className="text-white text-2xl" />}
      </motion.button>

      {/* Unread indicator */}
      {!isOpen && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="fixed bottom-[76px] right-6 z-[9991] bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
        >
          1
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[9990] w-[400px] max-w-[calc(100vw-3rem)] h-[580px] max-h-[calc(100vh-8rem)] glass-card flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="gradient-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <SmartToy className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{t('chat.title')}</h3>
                  <p className="text-white/70 text-xs">{t('chat.poweredBy')}</p>
                </div>
              </div>
              <button onClick={resetChat} className="text-white/70 hover:text-white transition" title="Reset chat">
                <RestartAlt className="text-lg" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A]/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <SmartToy className="text-blue-400 text-sm" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-[#1E293B] text-gray-200 shadow-sm rounded-bl-md border border-white/[0.06]'
                  }`}>
                    {msg.text}
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-white/[0.06]">
                        {msg.confidence && (
                          <span className="text-[10px] text-gray-500">
                            {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                        <button onClick={() => speakingId === msg.id ? stopSpeaking() : speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md transition ${
                            speakingId === msg.id
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10'
                          }`}>
                          <VolumeUp style={{ fontSize: 12 }} />
                          {speakingId === msg.id ? t('chat.speaking') : t('chat.listen')}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Person className="text-white text-sm" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <SmartToy className="text-blue-400 text-sm" />
                  </div>
                  <div className="bg-[#1E293B] px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-white/[0.06]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Speech error message */}
            {speechError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-amber-900/20 border-t border-amber-800 flex-shrink-0">
                <p className="text-xs text-amber-400 text-center font-medium">{speechError}</p>
              </motion.div>
            )}

            {/* Listening indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-red-900/20 border-t border-red-800 flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-6 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-1.5 h-5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-1.5 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                  <span className="text-xs font-semibold text-red-400">{t('chat.listening')}</span>
                  <button onClick={toggleMic}
                    className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full hover:bg-red-600 transition font-medium">
                    Stop
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick suggestions */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-[#111827] border-t border-white/[0.06]">
                <TipsAndUpdates className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="px-3 py-1 rounded-full bg-blue-900/20 text-blue-400 text-xs font-medium whitespace-nowrap hover:bg-blue-900/40 transition flex-shrink-0">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="px-3 py-3 bg-[#111827] border-t border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition placeholder:text-gray-500"
                  disabled={isTyping || isListening}
                />
                {speechSupported && (
                  <motion.button
                    onClick={toggleMic}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isTyping}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-white/5 text-gray-300 hover:bg-blue-900/20 hover:text-blue-400'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isListening ? <MicOff className="text-lg" /> : <Mic className="text-lg" />}
                  </motion.button>
                )}
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping || isListening}
                  className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="text-lg" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 text-center">
                Not a substitute for professional medical advice. Call 104 for emergencies.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
