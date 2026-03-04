

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"; 

console.log(import.meta.env.VITE_URL);


const convertApiResponseToResult = (apiData, originalText) => {
 
  const hateItem = apiData.find(item => item.label === 'hate');
  const nonHateItem = apiData.find(item => item.label === 'non-hate');
  
  const hateScore = hateItem ? hateItem.score : 0;
  const nonHateScore = nonHateItem ? nonHateItem.score : 1;
  
 
  const abuseScore = Math.round(hateScore * 100);
  

  let category = "neutral";
  let sentiment = "Neutral / Safe";
  
  if (abuseScore > 0 && abuseScore <= 20) { 
    category = "mild"; 
    sentiment = "Slightly Negative"; 
  }
  else if (abuseScore <= 40) { 
    category = "moderate"; 
    sentiment = "Moderately Abusive"; 
  }
  else if (abuseScore <= 70) { 
    category = "severe"; 
    sentiment = "Highly Abusive"; 
  }
  else if (abuseScore > 70) { 
    category = "extreme"; 
    sentiment = "Extremely Harassed"; 
  }


  const words = originalText.split(/\s+/);
  const totalWords = words.length;
  

  const estimatedHateWords = Math.ceil((abuseScore / 100) * totalWords * 0.3);
  const severeWords = abuseScore > 70 ? Math.ceil(estimatedHateWords * 0.6) : 0;
  const moderateWords = abuseScore > 40 ? Math.ceil(estimatedHateWords * 0.3) : 0;
  const mildWords = abuseScore > 20 ? estimatedHateWords - severeWords - moderateWords : 0;

  return {
    abuseScore,
    category,
    sentiment,
    isAbusive: abuseScore > 20,
    detectedWords: [],
    stats: {
      total: totalWords,
      severe: Math.max(0, severeWords),
      moderate: Math.max(0, moderateWords),
      mild: Math.max(0, mildWords),
    },
    apiData: {
      hateScore: Math.round(hateScore * 100),
      nonHateScore: Math.round(nonHateScore * 100),
      confidence: Math.max(hateScore, nonHateScore)
    }
  };
};


const categoryStyle = {
  neutral:  { bar: "#22c55e", badge: "bg-green-100 border-green-400 text-green-700",  icon: "✅", label: "SAFE CONTENT"          },
  mild:     { bar: "#facc15", badge: "bg-yellow-100 border-yellow-400 text-yellow-700", icon: "⚠️", label: "MILDLY NEGATIVE"       },
  moderate: { bar: "#fb923c", badge: "bg-orange-100 border-orange-400 text-orange-700", icon: "🚨", label: "MODERATELY ABUSIVE"    },
  severe:   { bar: "#ef4444", badge: "bg-red-100 border-red-400 text-red-700",         icon: "🔴", label: "HIGHLY ABUSIVE"        },
  extreme:  { bar: "#991b1b", badge: "bg-red-200 border-red-700 text-red-900",         icon: "💀", label: "EXTREMELY HARASSED"    },
};


const DonutChart = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-semibold text-gray-600">Abuse vs Clean</h3>
      <svg width="140" height="140" viewBox="0 0 140 140">
    
        <circle cx="70" cy="70" r={r} fill="none" stroke="#bbf7d0" strokeWidth="16" />
      
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={score === 0 ? "#22c55e" : score <= 25 ? "#facc15" : score <= 50 ? "#fb923c" : score <= 75 ? "#ef4444" : "#991b1b"}
          strokeWidth="16"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
        <text x="70" y="66" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#374151">{score}</text>
        <text x="70" y="82" textAnchor="middle" fontSize="11" fill="#9ca3af">/100</text>
      </svg>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Abusive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-200 inline-block" /> Clean
        </span>
      </div>
    </div>
  );
};


const BarChart = ({ stats }) => {
  const bars = [
    { label: "Severe",   count: stats.severe,   color: "bg-red-500"    },
    { label: "Moderate", count: stats.moderate, color: "bg-orange-400" },
    { label: "Mild",     count: stats.mild,     color: "bg-yellow-400" },
  ];
  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-600 text-center">
        Word Severity Breakdown
      </h3>
      <div className="flex items-end justify-center gap-6 h-32">
        {bars.map((bar) => {
          const heightPct = (bar.count / max) * 100;
          return (
            <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold text-gray-600">{bar.count}</span>
              <div className="w-full bg-gray-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                <div
                  className={`${bar.color} w-full rounded-t-lg transition-all duration-700`}
                  style={{ height: `${heightPct}%`, minHeight: bar.count > 0 ? "6px" : "0" }}
                />
              </div>
              <span className="text-xs text-gray-500 text-center">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const MeterBar = ({ score }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-xs text-gray-400">
      <span>Neutral</span>
      <span>Extremely Harassed</span>
    </div>
    <div className="relative h-7 rounded-full overflow-hidden flex">
      <div className="flex-1 bg-green-400" />
      <div className="flex-1 bg-yellow-400" />
      <div className="flex-1 bg-orange-400" />
      <div className="flex-1 bg-red-400" />
      <div className="flex-1 bg-red-800" />
     
      <div
        className="absolute top-0 h-full w-1.5 bg-white border-2 border-gray-800 rounded-full shadow-lg"
        style={{ left: `${Math.min(score, 98)}%`, transition: "left 0.7s ease" }}
      />
    </div>
    <div className="flex justify-between text-xs text-gray-400">
      <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
    </div>
  </div>
);


export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);


  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    
    if (prompt.trim().length < 3) {
      setError("Text is too short. Enter at least 3 characters.");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      console.log("Making AI analysis request...");
      const response = await axios.post('http://localhost:5000/api', { 
        prompt: prompt 
      });
     console.log(import.meta.env.VITE_URL)
      console.log("AI API Response:", response.data);
      
    
      const analysisResult = convertApiResponseToResult(response.data, prompt);
      
      setResult(analysisResult);
      setHistory((prev) => [
        { 
          prompt: prompt.trim(), 
          result: analysisResult, 
          time: new Date().toLocaleTimeString()
        },
        ...prev,
      ]);
      
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setError("Failed to analyze text with AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => { setPrompt(""); setResult(null); setError(""); };

  const style = result ? categoryStyle[result.category] : null;

  const historyColor = {
    neutral:  "border-l-green-500 bg-green-50",
    mild:     "border-l-yellow-400 bg-yellow-50",
    moderate: "border-l-orange-400 bg-orange-50",
    severe:   "border-l-red-500 bg-red-50",
    extreme:  "border-l-red-800 bg-red-100",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-8">

   
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl">🛡️</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            AI Abuse Language Detector
          </h1>
        </div>
        <p className="text-purple-300 text-sm">
          Advanced AI-powered hate speech detection and analysis
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6">

    
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">🤖 AI Text Analysis</h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type or paste any text here for advanced AI-powered hate speech detection..."
            rows={5}
            className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-700
              text-sm resize-none focus:outline-none focus:border-purple-400
              focus:ring-4 focus:ring-purple-100 transition-all placeholder-gray-300"
          />

          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{prompt.length} characters</span>
            <span>🤖 AI-powered analysis</span>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300
                text-white font-bold py-3 px-6 rounded-xl transition-all
                flex items-center justify-center gap-2 shadow-md
                active:scale-95 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  AI Analyzing…
                </>
              ) : (
                <>
                  🤖 Analyze with AI
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600
                font-bold py-3 px-5 rounded-xl transition-all active:scale-95"
            >
              🗑️ Clear
            </button>

            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700
                  font-bold py-3 px-5 rounded-xl transition-all active:scale-95"
              >
                📋 {showHistory ? "Hide" : "History"} ({history.length})
              </button>
            )}
          </div>
        </div>

  
        {result && style && (
          <>
        
            <div className={`${style.badge} border-2 rounded-2xl p-6 flex flex-col
              items-center gap-3 shadow-md`}>
              <span className="text-5xl">{style.icon}</span>
              <span className="font-bold text-xl tracking-widest">{style.label}</span>
              <p className="text-sm font-medium">AI Sentiment: {result.sentiment}</p>

           
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">AI Hate Score:</span>
                <span className="font-extrabold text-3xl">
                  {result.abuseScore}
                  <span className="text-sm font-normal">%</span>
                </span>
              </div>

           
              {result.apiData && (
                <div className="flex gap-6 text-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Hate Detected</span>
                    <span className="font-bold text-red-600">{result.apiData.hateScore}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Safe Content</span>
                    <span className="font-bold text-green-600">{result.apiData.nonHateScore}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">AI Confidence</span>
                    <span className="font-bold text-blue-600">
                      {Math.round(result.apiData.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

     
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
                📊 AI Harassment Level Analysis
              </h2>
              <MeterBar score={result.abuseScore} />

           
              <div className="grid grid-cols-5 gap-2 mt-5">
                {[
                  { label: "Neutral",  color: "bg-green-400",  cat: "neutral"  },
                  { label: "Mild",     color: "bg-yellow-400", cat: "mild"     },
                  { label: "Moderate", color: "bg-orange-400", cat: "moderate" },
                  { label: "Severe",   color: "bg-red-400",    cat: "severe"   },
                  { label: "Extreme",  color: "bg-red-800",    cat: "extreme"  },
                ].map((seg) => (
                  <div key={seg.cat}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all
                      ${result.category === seg.cat
                        ? `${seg.color} border-gray-500 scale-105 shadow`
                        : "bg-gray-50 border-transparent opacity-50"}`}>
                    <div className={`w-4 h-4 rounded-full ${seg.color} mb-1`} />
                    <span className="text-xs font-semibold text-gray-700">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
              <div className="bg-white rounded-2xl shadow-md p-6">
                <BarChart stats={result.stats} />
              </div>

             
              <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-center">
                <DonutChart score={result.abuseScore} />
              </div>
            </div>

        
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Words",    value: result.stats.total,    icon: "📄", bg: "bg-blue-50",   text: "text-blue-600"   },
                { label: "Severe Words",   value: result.stats.severe,   icon: "🔴", bg: "bg-red-50",    text: "text-red-600"    },
                { label: "Moderate Words", value: result.stats.moderate, icon: "🟠", bg: "bg-orange-50", text: "text-orange-600" },
                { label: "Mild Words",     value: result.stats.mild,     icon: "🟡", bg: "bg-yellow-50", text: "text-yellow-600" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex flex-col items-center shadow-sm`}>
                  <span className="text-2xl mb-1">{s.icon}</span>
                  <span className={`text-3xl font-extrabold ${s.text}`}>{s.value}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

    
        {showHistory && history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">🤖 AI Analysis History</h2>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-red-400 hover:text-red-600 font-semibold underline"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {history.map((item, i) => (
                <div key={i}
                  className={`border-l-4 rounded-lg p-3 ${historyColor[item.result.category]}`}>
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-gray-700 flex-1 truncate">
                      {categoryStyle[item.result.category].icon} {item.prompt}
                    </p>
                    <div className="text-xs font-bold text-gray-500 whitespace-nowrap text-right">
                      <div>AI Score: {item.result.abuseScore}%</div>
                      <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                        🤖 AI Analysis
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.time} · {item.result.sentiment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

     
        <p className="text-xs text-purple-400 text-center">
          © 2024 Group 29, Batch 2022-2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}