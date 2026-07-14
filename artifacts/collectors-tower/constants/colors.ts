/**
 * Semantic design tokens for Collector's Tower.
 *
 * Visual concept: a torchlit stone tower at night. Deep indigo/obsidian
 * surfaces, warm gold for value/progress (attack power, gold, rarity),
 * and ember red reserved for danger/enemy states (HP bars, wall floors).
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#161226',
    tint: '#C99A3D',

    // Core surfaces
    background: '#F4EFE4',
    foreground: '#1D1730',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#1D1730',

    // Primary action color (buttons, links, active states) — tower gold
    primary: '#B8862F',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7DFCB',
    secondaryForeground: '#1D1730',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#E7DFCB',
    mutedForeground: '#77708A',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#EADFC2',
    accentForeground: '#1D1730',

    // Destructive / danger — enemy HP, wall floors
    destructive: '#C3423F',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#DED4B8',
    input: '#DED4B8',
  },

  dark: {
    text: '#F1ECDD',
    tint: '#E3B04B',

    background: '#12101E',
    foreground: '#F1ECDD',

    card: '#1C1930',
    cardForeground: '#F1ECDD',

    primary: '#E3B04B',
    primaryForeground: '#1C1930',

    secondary: '#241F3C',
    secondaryForeground: '#F1ECDD',

    muted: '#241F3C',
    mutedForeground: '#9B93B8',

    accent: '#2C2748',
    accentForeground: '#F1ECDD',

    destructive: '#E0554F',
    destructiveForeground: '#FFFFFF',

    border: '#2C2748',
    input: '#2C2748',
  },

  // Border radius (in px) — applies to cards, buttons, inputs, modals.
  radius: 16,
};

export default colors;
