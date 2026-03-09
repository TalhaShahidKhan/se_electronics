'use client'

import React, { useState, KeyboardEvent, MouseEvent } from 'react';
import { Star } from 'lucide-react';
import { StarRatingProps } from '@/types';

const StarRating: React.FC<StarRatingProps> = ({
    value = 0,
    onChange,
    totalStars = 5,
    size = 24,
    readonly = false,
    allowHalfStars = true,
    activeColor = '#fbbf24',
    inactiveColor = '#d1d5db',
    hoverColor = '#fcd34d',
    className = '',
    showValue = false,
    name = 'rating'
}) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const handleStarClick = (starIndex: number, isHalf: boolean): void => {
        if (readonly) return;

        const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
        onChange?.(newRating);
    };

    const handleMouseMove = (starIndex: number, e: MouseEvent<HTMLDivElement>): void => {
        if (readonly) return;

        if (allowHalfStars) {
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            setHoverValue(isLeftHalf ? starIndex + 0.5 : starIndex + 1);
        } else {
            setHoverValue(starIndex + 1);
        }
    };

    const handleMouseLeave = (): void => {
        setHoverValue(null);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (readonly) return;

        const step = allowHalfStars ? 0.5 : 1;
        let newValue = value;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                e.preventDefault();
                newValue = Math.min(value + step, totalStars);
                onChange?.(newValue);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                e.preventDefault();
                newValue = Math.max(value - step, 0);
                onChange?.(newValue);
                break;
            case 'Home':
                e.preventDefault();
                onChange?.(step);
                break;
            case 'End':
                e.preventDefault();
                onChange?.(totalStars);
                break;
            default:
                break;
        }
    };

    const getStarFillPercentage = (starIndex: number): number => {
        const displayValue = hoverValue !== null ? hoverValue : value;
        const starValue = starIndex + 1;

        if (displayValue >= starValue) {
            return 100;
        } else if (displayValue > starIndex && displayValue < starValue) {
            return (displayValue - starIndex) * 100;
        }
        return 0;
    };

    const getStarColor = (starIndex: number): string => {
        const displayValue = hoverValue !== null ? hoverValue : value;
        if (hoverValue !== null && hoverValue > starIndex) {
            return hoverColor;
        }
        return displayValue > starIndex ? activeColor : inactiveColor;
    };

    return (
        <div className={`inline-flex flex-col gap-2 ${className}`}>
            <div
                className="inline-flex items-center gap-1"
                onMouseLeave={handleMouseLeave}
                role="radiogroup"
                aria-label={`Rating: ${value} out of ${totalStars} stars`}
                tabIndex={readonly ? -1 : 0}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                {Array.from({ length: totalStars }, (_, index) => {
                    const fillPercentage = getStarFillPercentage(index);
                    const starColor = getStarColor(index);

                    return (
                        <div
                            key={index}
                            className={`relative ${readonly ? '' : 'cursor-pointer'} ${isFocused ? 'outline-2 outline-offset-2 outline-blue-500' : ''
                                }`}
                            onMouseMove={(e) => handleMouseMove(index, e)}
                            onClick={(e) => {
                                if (allowHalfStars) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                                    handleStarClick(index, isLeftHalf);
                                } else {
                                    handleStarClick(index, false);
                                }
                            }}
                            role="radio"
                            aria-checked={value > index && value <= index + 1}
                            aria-label={`${index + 1} star${index === 0 ? '' : 's'}`}
                            style={{ width: size, height: size }}
                        >
                            {/* Background (empty) star */}
                            <Star
                                size={size}
                                fill={inactiveColor}
                                stroke={inactiveColor}
                                className="absolute top-0 left-0"
                            />

                            {/* Foreground (filled) star with clip-path */}
                            <div
                                style={{
                                    clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                                    width: size,
                                    height: size,
                                }}
                                className="absolute top-0 left-0"
                            >
                                <Star
                                    size={size}
                                    fill={starColor}
                                    stroke={starColor}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-sm text-gray-600 font-medium">
                    {value.toFixed(1)} / {totalStars}
                </span>
            )}

            {/* Hidden input for form compatibility */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={value}
                />
            )}
        </div>
    );
};

export default StarRating;