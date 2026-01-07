"use client";

import { useState, useEffect } from "react";

interface NewsCard {
  id: string;
  category: "good" | "bad" | "controversial";
  headline: string;
  summary: string;
  studioTake: string;
  timestamp: string;
  isApproved?: boolean;
}

const CATEGORY_CONFIG = {
  good: {
    title: "The Good",
    subtitle: "Innovation",
    borderColor: "border-emerald-500/30",
    accentColor: "text-emerald-400",
  },
  bad: {
    title: "The Bad",
    subtitle: "Industry Risks",
    borderColor: "border-red-500/30",
    accentColor: "text-red-400",
  },
  controversial: {
    title: "The Controversial",
    subtitle: "Ethics/Legal",
    borderColor: "border-amber-500/30",
    accentColor: "text-amber-400",
  },
};

export default function Dashboard() {
  const [cards, setCards] = useState<NewsCard[]>([]);
  const [approvedCards, setApprovedCards] = useState<NewsCard[]>([]);
  const [compiledMarkdown, setCompiledMarkdown] = useState<string>("");
  const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from database
  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/news-items", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add cache control to prevent stale data
          cache: "no-store",
        });
        
        // Always try to parse response, even if status is not 200
        const result = await response.json();
        
        if (result.success && result.data) {
          const allItems = result.data;
          
          // Separate approved and unapproved items
          const unapproved = allItems.filter((item: NewsCard) => !item.isApproved);
          const approved = allItems.filter((item: NewsCard) => item.isApproved);
          
          setCards(unapproved);
          setApprovedCards(approved);
          
          // Only show error if there's a warning and no data
          if (result.warning && allItems.length === 0) {
            setError(result.warning);
          } else if (result.warning) {
            // If we have data (even mock), just log the warning, don't show error
            console.info("API warning:", result.warning);
          }
        } else {
          // If no data in response, set error
          setError("No data received from server");
        }
      } catch (err) {
        console.error("Error fetching news items:", err);
        // Don't set error state - let the component show empty state
        // The API should always return mock data, so this shouldn't happen
        setError("Unable to load news items. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItems();
  }, []);

  const handleApprove = async (card: NewsCard) => {
    try {
      const response = await fetch(`/api/news-items/${card.id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve item");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Update local state
        setApprovedCards((prev) => [...prev, result.data]);
        setCards((prev) => prev.filter((c) => c.id !== card.id));
      }
    } catch (err) {
      console.error("Error approving item:", err);
      alert("Failed to approve item. Please try again.");
    }
  };

  const handleRemoveApproved = async (cardId: string) => {
    try {
      const response = await fetch(`/api/news-items/${cardId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isApproved: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove approval");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Update local state - move back to unapproved
        const removedCard = approvedCards.find((c) => c.id === cardId);
        if (removedCard) {
          setCards((prev) => [...prev, result.data]);
          setApprovedCards((prev) => prev.filter((c) => c.id !== cardId));
        }
      }
    } catch (err) {
      console.error("Error removing approval:", err);
      alert("Failed to remove approval. Please try again.");
    }
  };

  const getCardsByCategory = (category: "good" | "bad" | "controversial") => {
    return cards.filter((card) => card.category === category);
  };

  const compileFinalDraft = () => {
    if (approvedCards.length === 0) {
      alert("No approved cards to compile. Please approve some cards first.");
      return;
    }

    // Get current date for the issue
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Group approved cards by category
    const cardsByCategory = {
      good: approvedCards.filter((card) => card.category === "good"),
      bad: approvedCards.filter((card) => card.category === "bad"),
      controversial: approvedCards.filter((card) => card.category === "controversial"),
    };

    // Build markdown content
    let markdown = `# Hollywood AI Weekly\n\n`;
    markdown += `**Issue Date:** ${issueDate}\n\n`;
    markdown += `---\n\n`;

    // The Good section
    if (cardsByCategory.good.length > 0) {
      markdown += `## 🟢 The Good: Innovation\n\n`;
      cardsByCategory.good.forEach((card, index) => {
        markdown += `### ${index + 1}. ${card.headline}\n\n`;
        markdown += `${card.summary}\n\n`;
        markdown += `**Studio Take:** ${card.studioTake}\n\n`;
        markdown += `---\n\n`;
      });
    }

    // The Bad section
    if (cardsByCategory.bad.length > 0) {
      markdown += `## 🔴 The Bad: Industry Risks\n\n`;
      cardsByCategory.bad.forEach((card, index) => {
        markdown += `### ${index + 1}. ${card.headline}\n\n`;
        markdown += `${card.summary}\n\n`;
        markdown += `**Studio Take:** ${card.studioTake}\n\n`;
        markdown += `---\n\n`;
      });
    }

    // The Controversial section
    if (cardsByCategory.controversial.length > 0) {
      markdown += `## 🟡 The Controversial: Ethics & Legal\n\n`;
      cardsByCategory.controversial.forEach((card, index) => {
        markdown += `### ${index + 1}. ${card.headline}\n\n`;
        markdown += `${card.summary}\n\n`;
        markdown += `**Studio Take:** ${card.studioTake}\n\n`;
        markdown += `---\n\n`;
      });
    }

    markdown += `\n*Generated by Hollywood AI Studio*\n`;

    setCompiledMarkdown(markdown);
    setShowMarkdown(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledMarkdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Hollywood AI Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">Newsletter Dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800/50 rounded-lg text-red-200 text-sm">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <p>Loading news items...</p>
          </div>
        ) : (
          <>
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {(["good", "bad", "controversial"] as const).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const categoryCards = getCardsByCategory(category);

            return (
              <div
                key={category}
                className={`border ${config.borderColor} rounded-lg bg-slate-900/50 backdrop-blur-sm p-6`}
              >
                <div className="mb-6">
                  <h2 className={`text-xl font-semibold ${config.accentColor}`}>
                    {config.title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">{config.subtitle}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    {categoryCards.length} item{categoryCards.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {categoryCards.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No items yet
                    </div>
                  ) : (
                    categoryCards.map((card) => (
                      <NewsCardComponent
                        key={card.id}
                        card={card}
                        onApprove={handleApprove}
                        accentColor={config.accentColor}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Issue Preview */}
        <div className="border border-slate-700/50 rounded-lg bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-100">Weekly Issue Preview</h2>
            <p className="text-slate-400 text-sm mt-1">
              {approvedCards.length} approved item{approvedCards.length !== 1 ? "s" : ""}
            </p>
          </div>

          {approvedCards.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No approved items yet. Approve cards to add them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedCards.map((card) => {
                const config = CATEGORY_CONFIG[card.category];
                return (
                  <div
                    key={card.id}
                    className={`border ${config.borderColor} rounded-lg bg-slate-950/80 p-4 relative group`}
                  >
                    <button
                      onClick={() => handleRemoveApproved(card.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400 text-xs"
                    >
                      Remove
                    </button>
                    <div className={`text-xs font-medium ${config.accentColor} mb-2`}>
                      {config.title}
                    </div>
                    <h3 className="font-semibold text-slate-100 mb-2 text-sm">
                      {card.headline}
                    </h3>
                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                      {card.summary}
                    </p>
                    <div className="border-t border-slate-800 pt-3">
                      <p className="text-xs text-slate-500 font-medium mb-1">Studio Take:</p>
                      <p className="text-xs text-slate-300">{card.studioTake}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

            {/* Weekly Issue Generator */}
            <div className="mt-12 border border-slate-700/50 rounded-lg bg-slate-900/50 backdrop-blur-sm p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-100">Weekly Issue Generator</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Compile all approved items into a newsletter-ready Markdown format
                </p>
              </div>

              <button
                onClick={compileFinalDraft}
                disabled={approvedCards.length === 0}
                className="w-full py-3 px-6 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 hover:border-slate-500 rounded-md text-sm font-semibold text-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-800 disabled:hover:to-slate-700"
              >
                Compile Final Draft
              </button>

              {showMarkdown && compiledMarkdown && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-100">Compiled Markdown</h3>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-md text-sm font-medium text-slate-100 transition-colors flex items-center gap-2"
                    >
                      {copySuccess ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                  <div className="border border-slate-800/50 rounded-lg bg-slate-950/80 p-4">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                      {compiledMarkdown}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
}

interface NewsCardComponentProps {
  card: NewsCard;
  onApprove: (card: NewsCard) => void;
  accentColor: string;
}

function NewsCardComponent({ card, onApprove, accentColor }: NewsCardComponentProps) {
  return (
    <div className="border border-slate-800/50 rounded-lg bg-slate-950/80 p-4 hover:border-slate-700/50 transition-colors">
      <h3 className="font-semibold text-slate-100 mb-2 text-sm leading-tight">
        {card.headline}
      </h3>
      
      <div className="mb-3">
        <p className="text-xs text-slate-500 font-medium mb-1">Summary:</p>
        <p className="text-slate-300 text-xs leading-relaxed">{card.summary}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium mb-1">Studio Take:</p>
        <p className="text-slate-400 text-xs leading-relaxed">{card.studioTake}</p>
      </div>

      <button
        onClick={() => onApprove(card)}
        className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-md text-xs font-medium text-slate-100 transition-colors"
      >
        Approve
      </button>
    </div>
  );
}
