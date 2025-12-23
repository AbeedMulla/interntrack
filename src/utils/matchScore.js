// src/utils/matchScore.js
// Resume matching algorithm using keyword overlap
// Simple and easy to explain in interviews!

/**
 * Calculates how well a resume matches a job description
 * Uses a simple keyword overlap approach
 * 
 * Algorithm Explanation:
 * 1. Extract keywords from both resume and job description
 * 2. Find keywords that appear in both (matched)
 * 3. Find job keywords not in resume (missing)
 * 4. Calculate match score as percentage of matched keywords
 * 
 * @param {string} resumeText - Text extracted from resume
 * @param {string} jobDescription - Job description text
 * @returns {Object} - { score, matchedKeywords, missingKeywords }
 */
export function calculateMatchScore(resumeText, jobDescription) {
    // Step 1: Extract keywords from both texts
    const resumeKeywords = extractKeywords(resumeText)
    const jobKeywords = extractKeywords(jobDescription)
  
    // Step 2: Find matched keywords (appear in both)
    // Using Set intersection
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.includes(keyword)
    )
  
    // Step 3: Find missing keywords (in job but not in resume)
    // These are skills/keywords the candidate should consider adding
    const missingKeywords = jobKeywords.filter(keyword => 
      !resumeKeywords.includes(keyword)
    )
  
    // Step 4: Calculate match score as percentage
    // Score = (matched keywords / total job keywords) * 100
    // Avoid division by zero
    const score = jobKeywords.length > 0
      ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
      : 0
  
    return {
      score,
      matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
      missingKeywords: [...new Set(missingKeywords)].slice(0, 15) // Top 15 missing
    }
  }
  
  /**
   * Extracts meaningful keywords from text
   * Filters out common words (stop words) and short words
   * 
   * @param {string} text - Input text
   * @returns {string[]} - Array of lowercase keywords
   */
  function extractKeywords(text) {
    if (!text) return []
  
    // Common words to ignore (stop words)
    // These don't provide meaningful matching value
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
      'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'whom',
      'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
      'our', 'your', 'their', 'my', 'his', 'her', 'about', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'any', 'up',
      'down', 'out', 'off', 'over', 'under', 'while', 'if', 'because',
      'until', 'unless', 'although', 'though', 'since', 'even', 'etc',
      'ie', 'eg', 'per', 'via', 'amp', 'years', 'year', 'experience',
      'team', 'work', 'working', 'ability', 'skills', 'strong', 'including',
      'responsibilities', 'requirements', 'required', 'preferred', 'looking'
    ])
  
    // Convert to lowercase and split into words
    // Remove special characters except for common tech terms
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, ' ') // Keep +, #, . for tech terms like C++, C#, Node.js
      .split(/\s+/)
      .filter(word => {
        // Keep words that are:
        // - At least 2 characters
        // - Not in stop words list
        // - Or are known tech terms (even if short)
        const techTerms = ['ai', 'ml', 'ui', 'ux', 'qa', 'ci', 'cd', 'js', 'ts', 'db', 'c#', 'c++']
        return (word.length >= 2 && !stopWords.has(word)) || techTerms.includes(word)
      })
  
    return words
  }
  
  /**
   * Gets suggestions to improve match score
   * Provides actionable feedback for the user
   * 
   * @param {number} score - Match percentage
   * @param {string[]} missingKeywords - Keywords not found in resume
   * @returns {string[]} - Array of suggestions
   */
  export function getMatchSuggestions(score, missingKeywords) {
    const suggestions = []
  
    // Add score-based suggestions
    if (score < 30) {
      suggestions.push('Your resume may not be a strong match for this role. Consider tailoring it more specifically.')
    } else if (score < 50) {
      suggestions.push('There\'s room to improve your match. Add more relevant keywords from the job description.')
    } else if (score < 70) {
      suggestions.push('Good match! A few additions could make your resume even stronger.')
    } else {
      suggestions.push('Excellent match! Your resume aligns well with this job description.')
    }
  
    // Add keyword-specific suggestions
    if (missingKeywords.length > 0) {
      const keyTerms = missingKeywords.slice(0, 5).join(', ')
      suggestions.push(`Consider adding these keywords if relevant to your experience: ${keyTerms}`)
    }
  
    return suggestions
  }