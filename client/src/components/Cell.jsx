import React from "react";
import { useGameStore } from "../store/useGameStore";
import { useThemeStore } from "../store/useThemeStore";
import { useSpring, animated } from "@react-spring/web";
import { getThemeById } from "../utils/themeUtils";

const Cell = ({ index, cellSize }) => {
    const value = useGameStore((state) => state.board[index]);
    const makeMove = useGameStore((state) => state.makeMove);
    const winner = useGameStore((state) => state.winner);
    const winningCells = useGameStore((state) => state.winningCells) || [];
    const thinking = useGameStore((state) => state.thinking);

    const { themeConfig, currentTheme } = useThemeStore();
    const theme = getThemeById(currentTheme, themeConfig);

    const handleClick = () => {
        if (!winner && value === null && !thinking) makeMove(index);
    };

    const isWinningCell = winningCells.includes(index);

    const springProps = useSpring({
        transform: value ? "scale(1)" : "scale(0)",
        opacity: value ? 1 : 0,
        config: { tension: 300, friction: 15 },
    });

    const winningSpring = useSpring({
        transform: isWinningCell ? "scale(1.05)" : "scale(1)",
        boxShadow: isWinningCell ? `0 12px 30px ${theme.winLine}55` : "0 0 0 transparent",
        config: { tension: 400, friction: 10 },
    });

    const fontSize = cellSize * 0.6; // 60% of the cell size

    const getAriaLabel = () => {
        const position = `Cell ${index + 1}`; // 1 based conversion
        if (value) {
            return `${position} contains ${value}`;
        }

        if (winner || thinking) {
            return `${position} empty, disabled`;
        }

        return `${position}, empty clickable`;
    }

    return (
        <animated.button
            onClick={handleClick}
            disabled={value !== null || winner !== null || thinking}
            aria-label={getAriaLabel()}
            aria-pressed={value !== null}
            tabIndex={value === null && !winner && !thinking ? 0 : -1}
            className="w-full h-full flex justify-center items-center font-bold cursor-pointer disabled:cursor-not-allowed"
            style={{
                backgroundColor: theme.boardColor,
                borderColor: theme.borderColor,
                borderWidth: 1,
                transition: "background-color 0.2s, border-color 0.2s",
                fontSize,
                ...winningSpring,
            }}
        >
            <animated.span style={springProps} className="flex justify-center items-center w-full h-full leading-none">
                {value === "X" ? (
                    <span style={{ color: theme.xColor }}>{value}</span>
                ) : value === "O" ? (
                    <span style={{ color: theme.oColor }}>{value}</span>
                ) : null}
            </animated.span>
        </animated.button>
    );
};

export default Cell;
