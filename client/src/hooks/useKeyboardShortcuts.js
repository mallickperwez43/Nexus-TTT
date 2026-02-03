import { useEffect, useCallback, useState } from 'react'

/**
 * Custom hook for keyboard shortcuts in Tic Tac Toe
 * @param {Object} actions - Game actions
 * @param {Function} actions.undoMove - Undo function
 * @param {Function} actions.redoMove - Redo function
 * @param {Function} actions.resetGame - New game function
 * @param {Function} actions.setBoardSize - Change board size
 * @param {boolean} canUndo - Whether undo is available
 * @param {boolean} canRedo - Whether redo is available
 * @param {boolean} isThinking - AI is thinking (disable shortcuts)
 */

export const useKeyboardShortCuts = ({ undoMove, redoMove, resetGame, setBoardSize, canUndo, canRedo, isThinking = false, navigate }) => {
    // Add this state for managing help modal
    const [showHelp, setShowHelp] = useState(false);

    // Memoize handlers to prevent re-renders
    const handleKeyDown = useCallback((event) => {
        // Don't trigger shortcuts if:
        // 1. User is typing in input/textarea
        // 2. AI is thinking
        // 3. Event is from an input with modifier keys (Ctrl+A, etc.)

        const isInput = event.target.matches('input, textarea, select, [contenteditable="true"]'); // ✅ Fixed
        const isModifierWithInput = (event.ctrlKey || event.metaKey) && isInput;

        // Don't process most shortcuts when help is open (except Escape)
        if (showHelp && event.key !== 'Escape') {
            event.preventDefault();
            return;
        }

        if (isThinking || isModifierWithInput) {
            return;
        }

        // ESCAPE: Close modal or go back
        if (event.key === 'Escape') {
            event.preventDefault();

            if (showHelp) {
                setShowHelp(false);
                return;
            }

            // If there's a winner modal, it might handle escape already
            // Otherwise, navigate back
            if (navigate && !event.defaultPrevented) { // ✅ Fixed: removed extra )
                navigate('/mode');
            }
            return;
        }

        // Don't trigger shortcuts if user is typing (but allow Escape)
        if (isInput) {
            return;
        }

        // HELP: ? or H (case insensitive)
        if (event.key === '?' || event.key.toLowerCase() === 'h') {
            event.preventDefault();
            setShowHelp(true); // This will trigger the HelpModal
            showShortcutFeedback('📖 Help');
            return;
        }

        // UNDO: Ctrl+Z or Cmd+Z (Windows/Mac)
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
            if (canUndo) {
                event.preventDefault();
                undoMove();
                // Visual feedback
                showShortcutFeedback('↶ Undo');
            }
            return;
        }

        // REDO: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
        if (((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
            ((event.ctrlKey || event.metaKey) && event.key === 'y')) {
            if (canRedo) {
                event.preventDefault();
                redoMove();
                // Visual feedback
                showShortcutFeedback('↷ Redo');
            }
            return;
        }

        // NEW GAME: N or Space (when not in input)
        if (event.key === 'n' || event.key === ' ') {
            if (event.target === document.body || !isInput) {
                event.preventDefault();
                resetGame();
                showShortcutFeedback('🔄 New Game');
            }
            return;
        }

        // BOARD SIZE: Number keys 3-0 (3 to 10)
        if (event.key >= '3' && event.key <= '9') {
            const size = parseInt(event.key);
            event.preventDefault();
            if (setBoardSize) {
                setBoardSize(size);
                showShortcutFeedback(`Board: ${size}×${size}`);
            }
            return;
        }
        if (event.key === '0') {
            event.preventDefault();
            if (setBoardSize) {
                setBoardSize(10);
                showShortcutFeedback('Board: 10×10');
            }
            return;
        }

        // FULLSCREEN: F11 or F
        if (event.key === 'F11' || (event.key === 'f' && event.altKey)) {
            event.preventDefault();
            toggleFullscreen();
            return;
        }
    }, [undoMove, redoMove, resetGame, setBoardSize, canUndo, canRedo, isThinking, navigate, showHelp]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Return the state so parent component can use it
    return {
        showHelp,
        setShowHelp
    };
};

// Helper function to show visual feedback
const showShortcutFeedback = (message) => {
    // Remove existing feedback
    const existing = document.getElementById('shortcut-feedback');
    if (existing) {
        existing.remove();
    }

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.id = 'shortcut-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        animation: fadeInOut 2s ease;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(feedback);

    // Auto-remove after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
            style.remove();
        }
    }, 2000);
};

// Optional: Fullscreen toggle
const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen();
    }
};

export default useKeyboardShortCuts;