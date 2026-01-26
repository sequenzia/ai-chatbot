import React, { useState, useEffect } from "react";
import {
  History,
  Settings,
  SquarePen,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  MessageSquare,
  Moon,
  Sun,
  BookOpen,
  HelpCircle,
  Menu,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useConversations } from "@/hooks/useConversations";
import { useChat2 } from "@/components/chat/ChatProvider";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  showWelcomeScreen: boolean;
}

export function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  showWelcomeScreen,
}: SidebarProps) {
  const { isMobile, isTablet } = useDeviceType();
  const prefersReducedMotion = useReducedMotion();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Get real conversations from database
  const { conversations, deleteConversation, clearAllConversations } = useConversations();
  const { conversationId, switchConversation, startNewConversation } = useChat2();

  // User placeholder (will be replaced with real auth later)
  const userName = 'Dev User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate sidebar width based on device type
  const getSidebarWidth = () => {
    if (!isOpen) return isMobile ? 0 : 72;
    if (isMobile) return 'min(85vw, 320px)';
    if (isTablet) return 300;
    return 280;
  };

  useEffect(() => {
    // Close user menu when sidebar is collapsed
    if (!isOpen && showUserMenu) {
      setShowUserMenu(false);
    }
  }, [isOpen, showUserMenu]);

  const handleConversationClick = (id: string) => {
    switchConversation(id);
    if (isMobile) {
      onToggle(); // Close sidebar on mobile after selecting
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the conversation click

    // If deleting the current conversation, start a new one first
    if (id === conversationId) {
      await startNewConversation();
    }

    await deleteConversation(id);
  };

  const handleClearAllHistory = async () => {
    await clearAllConversations();
    await startNewConversation();
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: getSidebarWidth(),
        }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed lg:relative z-50 h-dvh bg-sidebar border-r border-sidebar-border overflow-hidden flex flex-col shrink-0 text-sidebar-foreground transition-colors duration-200 sidebar-landscape-constraint"
        style={{
          paddingTop: 'var(--safe-area-inset-top)',
          paddingBottom: 'var(--safe-area-inset-bottom)',
        }}
      >
        <div
          className={`flex flex-col h-full ${isOpen ? "px-4" : "px-2"} py-4 transition-all duration-300`}
        >
          {/* Header / Toggle */}
          <div
            className={`flex items-center ${isOpen ? "justify-between mb-8" : "justify-center mb-6"} min-h-[40px]`}
          >
            {isOpen ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                    <Sparkles className="size-5 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-semibold text-sidebar-foreground">
                    AI Chatbot
                  </span>
                </div>
                <button
                  onClick={onToggle}
                  aria-label="Close sidebar"
                  aria-expanded={isOpen}
                  className="p-2.5 min-h-[44px] min-w-[44px] hover:bg-sidebar-accent rounded-md transition-colors text-muted-foreground hover:text-sidebar-foreground flex items-center justify-center"
                >
                  <PanelLeftClose className="size-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onToggle}
                aria-label="Open sidebar"
                aria-expanded={isOpen}
                className="p-2.5 min-h-[44px] min-w-[44px] hover:bg-sidebar-accent rounded-lg transition-colors text-muted-foreground hover:text-sidebar-foreground flex items-center justify-center"
              >
                <PanelLeftOpen className="size-5" />
              </button>
            )}
          </div>

          {/* New Chat Button */}
          {!isMobile && (
            <div
              className={`flex ${isOpen ? "mb-6" : "mb-8 justify-center"}`}
            >
              {isOpen ? (
                <button
                  onClick={onNewChat}
                  aria-label="Start new chat"
                  className="flex items-center gap-2 w-full p-3 min-h-[44px] bg-sidebar-accent border border-sidebar-border text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/80 transition-all text-sm font-medium shadow-sm"
                >
                  <SquarePen className="size-4" />
                  <span>New chat</span>
                </button>
              ) : (
                <button
                  onClick={onNewChat}
                  aria-label="Start new chat"
                  className="p-2.5 min-h-[44px] min-w-[44px] bg-background border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors shadow-sm flex items-center justify-center"
                >
                  <SquarePen className="size-5" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Items (Visible in Collapsed) */}
          {!isOpen && (
            <div className="flex flex-col gap-4 items-center w-full">
              <button
                aria-label="View chats"
                className="p-2.5 min-h-[44px] min-w-[44px] bg-background border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors shadow-sm flex items-center justify-center"
              >
                <MessageSquare className="size-5" />
              </button>
            </div>
          )}

          {/* Expanded Content: History */}
          {isOpen && (
            <div className="flex-1 overflow-y-auto -mx-2 px-2">
              <div className="flex items-center gap-2 mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <History className="size-3" />
                <span>Recent History</span>
              </div>
              <nav className="space-y-1" aria-label="Chat history">
                {conversations.length === 0 ? (
                  <div className="text-sm text-muted-foreground px-3 py-2">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((chat) => (
                    <div
                      key={chat.id}
                      className={`w-full flex items-center gap-1 rounded-lg transition-colors group ${
                        chat.id === conversationId
                          ? 'bg-sidebar-accent'
                          : 'hover:bg-sidebar-accent'
                      }`}
                    >
                      <button
                        onClick={() => handleConversationClick(chat.id)}
                        aria-label={`Open chat: ${chat.title}`}
                        aria-current={chat.id === conversationId ? 'page' : undefined}
                        className="flex-1 flex flex-col items-start gap-1 p-3 min-h-[44px] text-left overflow-hidden min-w-0"
                      >
                        <span className={`text-sm truncate w-full ${
                          chat.id === conversationId
                            ? 'text-sidebar-foreground'
                            : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                        }`}>
                          {chat.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(e, chat.id)}
                        aria-label={`Delete chat: ${chat.title}`}
                        className="p-2 mr-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </nav>
            </div>
          )}

          {/* Footer / User Profile */}
          <div
            className={`mt-auto pt-4 border-t border-sidebar-border ${isOpen ? "" : "flex flex-col items-center gap-3"} relative`}
          >
            {isOpen ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  className="flex items-center gap-3 w-full p-3 min-h-[44px] rounded-lg hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                >
                  <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground">
                    <span className="text-xs font-medium">
                      {userInitials}
                    </span>
                  </div>
                  <span className="flex-1 text-left">
                    {userName}
                  </span>
                </button>

                {/* User Menu - Expanded Sidebar */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-lg overflow-hidden"
                      role="menu"
                      aria-label="User menu"
                    >
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowSettings(true);
                        }}
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <BookOpen className="size-4" />
                        <span>Learn More</span>
                      </button>
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <HelpCircle className="size-4" />
                        <span>Get Help</span>
                      </button>
                      <div className="border-t border-border" />
                      <button
                        onClick={handleClearAllHistory}
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-destructive/10 transition-colors text-sm text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete All History</span>
                      </button>
                      <div className="border-t border-border" />
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    onToggle();
                    setShowUserMenu(true);
                  }}
                  aria-label="User menu"
                  className="size-10 min-h-[44px] min-w-[44px] rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-medium text-xs hover:bg-sidebar-accent/80 transition-colors"
                >
                  {userInitials}
                </button>

                {/* User Menu - Collapsed Sidebar */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-0 left-full ml-2 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-lg overflow-hidden min-w-[200px]"
                      role="menu"
                      aria-label="User menu"
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground">
                            <span className="text-xs font-medium">{userInitials}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{userName}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowSettings(true);
                        }}
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <BookOpen className="size-4" />
                        <span>Learn More</span>
                      </button>
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <HelpCircle className="size-4" />
                        <span>Get Help</span>
                      </button>
                      <div className="border-t border-border" />
                      <button
                        onClick={handleClearAllHistory}
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-destructive/10 transition-colors text-sm text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete All History</span>
                      </button>
                      <div className="border-t border-border" />
                      <button
                        role="menuitem"
                        className="flex items-center gap-3 w-full p-3 min-h-[44px] hover:bg-sidebar-accent transition-colors text-sm text-muted-foreground hover:text-sidebar-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Toggle Button (when closed) */}
      {!isOpen && isMobile && (
        <button
          onClick={onToggle}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          className="fixed z-40 p-3 min-h-[48px] min-w-[48px] hover:bg-muted rounded-lg transition-colors border border-border bg-background shadow-sm lg:hidden flex items-center justify-center"
          style={{
            top: 'max(1rem, var(--safe-area-inset-top))',
            left: 'max(1rem, var(--safe-area-inset-left))',
          }}
        >
          <Menu className="size-5 text-muted-foreground" />
        </button>
      )}

      {/* Mobile New Chat Button (when sidebar closed) */}
      {!isOpen && isMobile && !showWelcomeScreen && (
        <button
          onClick={onNewChat}
          aria-label="Start new chat"
          className="fixed z-40 p-3 min-h-[48px] min-w-[48px] hover:bg-muted rounded-lg transition-colors border border-border bg-background text-muted-foreground shadow-sm lg:hidden flex items-center justify-center"
          style={{
            top: 'max(1rem, var(--safe-area-inset-top))',
            right: 'max(1rem, var(--safe-area-inset-right))',
          }}
        >
          <SquarePen className="size-5" />
        </button>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                  className="p-2 min-h-[44px] min-w-[44px] hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Appearance</h3>
                  <div className="flex gap-3" role="radiogroup" aria-label="Theme selection">
                    <button
                      onClick={() => {
                        if (theme === 'dark') toggleTheme();
                      }}
                      role="radio"
                      aria-checked={theme === 'light'}
                      aria-label="Light theme"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-lg border transition-all ${
                        theme === 'light'
                          ? 'bg-accent border-border shadow-sm'
                          : 'bg-transparent border-border/50 hover:bg-accent/50'
                      }`}
                    >
                      <Sun className="size-4" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => {
                        if (theme === 'light') toggleTheme();
                      }}
                      role="radio"
                      aria-checked={theme === 'dark'}
                      aria-label="Dark theme"
                      className={`flex-1 flex items-center justify-center gap-2 p-3 min-h-[44px] rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-accent border-border shadow-sm'
                          : 'bg-transparent border-border/50 hover:bg-accent/50'
                      }`}
                    >
                      <Moon className="size-4" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}