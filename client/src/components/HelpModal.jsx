import React from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { getThemeById } from '../utils/themeUtils';

const HelpModal = ({ isOpen, onClose }) => {
    const { themeConfig, currentTheme } = useThemeStore();
    const theme = getThemeById(currentTheme, themeConfig);

    if (!isOpen) return null;

    const shortcuts = [
        { keys: ['Ctrl+Z', 'Cmd+Z'], action: 'Undo last move' },
        { keys: ['Ctrl+Y', 'Ctrl+Shift+Z', 'Cmd+Shift+Z'], action: 'Redo move' },
        { keys: ['N', 'Space'], action: 'Start new game' },
        { keys: ['3', '4', '5', '6', '7', '8', '9', '0'], action: 'Change board size' },
        { keys: ['Escape'], action: 'Back to menu' },
        { keys: ['H', '?'], action: 'Show this help' },
        { keys: ['Alt+F', 'F11'], action: 'Toggle fullscreen' },
    ];

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-1000 p-4"
            onClick={onClose}
        >
            <div
                className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
                style={{
                    backgroundColor: theme.boardColor,
                    color: theme.textColor,
                    border: `2px solid ${theme.borderColor}`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold" style={{ color: theme.headingColor }}>
                            ⌨️ Keyboard Shortcuts
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-3xl hover:opacity-70 transition-opacity"
                            style={{ color: theme.textColor }}
                            aria-label="Close help"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {shortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg transition-transform hover:scale-[1.02]"
                                style={{
                                    backgroundColor: theme.buttonBg + '20',
                                    border: `1px solid ${theme.borderColor}`,
                                }}
                            >
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {shortcut.keys.map((key, i) => (
                                        <kbd
                                            key={i}
                                            className="px-3 py-1 rounded font-mono text-sm font-bold transition-colors"
                                            style={{
                                                backgroundColor: theme.buttonBg,
                                                color: theme.buttonText,
                                            }}
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                                <p className="text-sm">{shortcut.action}</p>
                            </div>
                        ))}
                    </div>

                    <div
                        className="text-sm opacity-75 italic mb-4 p-3 rounded"
                        style={{ backgroundColor: theme.boardColor + '40' }}
                    >
                        <p>💡 Tip: Shortcuts are disabled when AI is thinking or when typing in inputs.</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                            backgroundColor: theme.buttonBg,
                            color: theme.buttonText,
                        }}
                    >
                        Got it! (Press Escape)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;