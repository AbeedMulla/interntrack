// src/pages/Dashboard.jsx
// Dashboard showing application statistics
// Displays counts for each application status

import { useMemo } from "react";
import { Link } from 'react-router-dom'
import { useApplications } from "../contexts/ApplicationsContext";
import { useAuth } from '../contexts/AuthContext'
import { statusBadgeClasses } from "../utils/statusClasses";
import { 
  Send, 
  FileCode, 
  Users, 
  XCircle, 
  Trophy,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {

  // Fetch applications and calculate stats
  const { applications, loading: appsLoading } = useApplications();

  const stats = useMemo(() => {
    const counts = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0,
      total: applications.length,
    };
  
    for (const app of applications) {
      if (Object.prototype.hasOwnProperty.call(counts, app.status)) {
        counts[app.status]++;
      }
    }
  
    return counts;
  }, [applications]);
  
  const recentApps = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const dateA = a.dateApplied?.toDate?.() || new Date(a.dateApplied);
        const dateB = b.dateApplied?.toDate?.() || new Date(b.dateApplied);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [applications]);
  

  

  // Stats card configuration
  const statCards = [
    { 
      label: 'Applied', 
      value: stats.Applied, 
      icon: Send, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Online Assessment', 
      value: stats.OA, 
      icon: FileCode, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    { 
      label: 'Interview', 
      value: stats.Interview, 
      icon: Users, 
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    { 
      label: 'Rejected', 
      value: stats.Rejected, 
      icon: XCircle, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    { 
      label: 'Offer', 
      value: stats.Offer, 
      icon: Trophy, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
  ]

  // Calculate success rate (offers / total applications)
  const successRate = stats.total > 0 
    ? Math.round((stats.Offer / stats.total) * 100) 
    : 0

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = date?.toDate?.() || new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (appsLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    )
  }

  return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your internship application journey
            </p>
          </div>
          <Link
            to="/tracker"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Add Application
          </Link>
        </div>

        {/* Total Applications Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 font-medium">Total Applications</p>
              <p className="font-display font-bold text-5xl mt-2">{stats.total}</p>
              <p className="text-emerald-100 mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {successRate}% success rate
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map(({ label, value, icon: Icon, bgColor, textColor }) => (
            <div
              key={label}
              className={`${bgColor} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center gap-3">
                <div className={`${textColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-display font-bold text-2xl ${textColor}`}>
                    {value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
              Recent Applications
            </h2>
            <Link
              to="/tracker"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="p-12 text-center">
              <Send className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
              <Link
                to="/tracker"
                className="inline-block mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium"
              >
                Add your first application →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentApps.map((app) => (
                <div key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.company}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{app.role}</p>
                    </div>
                    <div className="text-right">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(app.status)}`}
                        >
                        {app.status}
                    </span>

                      <p className="text-xs text-gray-400 mt-1">{formatDate(app.dateApplied)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default Dashboard