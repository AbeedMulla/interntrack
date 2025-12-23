// src/pages/ResumeMatcher.jsx
// Resume matching tool that compares resume against job description
// Extracts text from PDF/TXT files and calculates keyword match

import { useState, useCallback } from 'react'
import { calculateMatchScore, getMatchSuggestions } from '../utils/matchScore'
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'

const ResumeMatcher = () => {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle file upload
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setLoading(true)

    try {
      const fileType = file.type
      const name = file.name
      setFileName(name)

      let text = ''

      if (fileType === 'text/plain' || name.endsWith('.txt')) {
        // Handle TXT files - simple text reading
        text = await file.text()
      } else if (fileType === 'application/pdf' || name.endsWith('.pdf')) {
        // Handle PDF files using pdf.js
        text = await extractPDFText(file)
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or TXT file.')
      }

      setResumeText(text)
      setResult(null) // Clear previous results
    } catch (err) {
      console.error('File upload error:', err)
      setError(err.message || 'Failed to read file. Please try again.')
      setResumeText('')
      setFileName('')
    } finally {
      setLoading(false)
    }
  }, [])

  // Extract text from PDF using pdf.js
  const extractPDFText = async (file) => {
    // Dynamically import pdf.js to reduce initial bundle size
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  }

  // Analyze match between resume and job description
  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      setError('Please upload a resume first')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setError('')
    setLoading(true)

    // Small delay for UX (shows loading state)
    setTimeout(() => {
      const matchResult = calculateMatchScore(resumeText, jobDescription)
      const suggestions = getMatchSuggestions(matchResult.score, matchResult.missingKeywords)
      
      setResult({
        ...matchResult,
        suggestions
      })
      setLoading(false)
    }, 500)
  }

  // Reset all state
  const handleReset = () => {
    setResumeText('')
    setJobDescription('')
    setFileName('')
    setResult(null)
    setError('')
  }

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'from-emerald-500 to-cyan-500'
    if (score >= 50) return 'from-amber-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
              Resume Matcher
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              See how well your resume matches a job description
            </p>
          </div>
          {(resumeText || jobDescription || result) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Resume Upload */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Your Resume
              </h2>

              {/* File Upload Area */}
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  fileName 
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
                    </div>
                  ) : fileName ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{fileName}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        Click to upload a different file
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Upload your resume
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PDF or TXT files supported
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Resume Text Preview */}
              {resumeText && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extracted Text Preview
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Job Description */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Job Description
              </h2>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                placeholder="Paste the job description here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !resumeText || !jobDescription}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Match
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* Score Card */}
            <div className={`bg-gradient-to-r ${getScoreBg(result.score)} rounded-2xl p-8 text-white shadow-xl`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-white/80 font-medium mb-2">Match Score</p>
                  <p className="font-display font-bold text-6xl">{result.score}%</p>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-sm text-white/90">
                        {suggestion}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Matched Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Matched Keywords ({result.matchedKeywords.length})
                  </h3>
                </div>
                
                {result.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No matching keywords found
                  </p>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Missing Keywords ({result.missingKeywords.length})
                  </h3>
                </div>
                
                {result.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Great job! You've covered all the key terms
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  )
}

export default ResumeMatcher