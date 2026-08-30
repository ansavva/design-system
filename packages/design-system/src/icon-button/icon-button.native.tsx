// NATIVE LEAF — React Native primitives over @ansavva/tokens. Metro resolves
// this. Mirrors button.native.tsx's shape; what it adds is the accessible name
// (always) and the toggle state (only when asked for).
import * as React from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { radii } from '@ansavva/tokens';

import { useNativeColors } from '../lib/native-theme';
import type { IconButtonIntent, IconButtonOwnProps, IconButtonSize } from './icon-button.props';

// `children` is Omit-ed because PressableProps types it as a render function
// as well as a node, and this component puts its child inside a <Text> — a
// function child would be handed the press state and never rendered. The
// name props are Omit-ed for the same reason the web leaf omits `aria-label`:
// `label` owns the accessible name outright.
export interface IconButtonProps
  extends
    Omit<PressableProps, 'children' | 'accessibilityLabel' | 'aria-label'>,
    IconButtonOwnProps {}

const sizeBox: Record<IconButtonSize, number> = { sm: 32, md: 44 };

// Font size WITHOUT a line height, unlike button.native.tsx's label. This is a
// glyph pinned inside a fixed square, which is the case native-typography.ts
// carves out by name (the Checkbox tick, the Select chevron, the Avatar
// fallback): a taller line box would fight the box rather than the text around
// it, because there is no text around it.
const iconText: Record<IconButtonSize, number> = { sm: 14, md: 16 };

export function IconButton({
  label,
  intent = 'ghost',
  size = 'md',
  pressed,
  children,
  disabled,
  style,
  ...props
}: IconButtonProps) {
  // Colors resolve per render so the leaf follows the OS scheme; only the
  // scheme-independent maps and layout live at module level.
  const c = useNativeColors();
  const intentBg: Record<IconButtonIntent, string> = {
    primary: c.primary,
    secondary: c.surfaceAlt,
    ghost: 'transparent',
    danger: c.danger,
  };
  const intentFg: Record<IconButtonIntent, string> = {
    primary: c.primaryText,
    secondary: c.ink,
    ghost: c.ink,
    danger: c.primaryText,
  };
  const pressedBg: Record<IconButtonIntent, string> = {
    primary: c.primaryActive,
    secondary: c.line,
    ghost: c.line,
    danger: c.dangerHover,
  };

  // Pressed is reported BOTH ways, the split toggle.native.tsx measured against
  // this repo's pinned react-native-web: `accessibilityState` for the real
  // native platforms, and `aria-pressed` — which has no react-native type at
  // all, hence the contained cast — for react-native-web, whose DOM prop
  // translation does not flatten `accessibilityState` into any `aria-*`
  // attribute. Spread only when `pressed` was given, so a one-shot button
  // announces no toggle it does not have.
  const toggleProps = (
    pressed === undefined
      ? {}
      : { accessibilityState: { selected: pressed }, 'aria-pressed': pressed }
  ) as PressableProps;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      {...toggleProps}
      disabled={disabled ?? undefined}
      style={(state) => [
        styles.base,
        {
          width: sizeBox[size],
          height: sizeBox[size],
          backgroundColor: pressed === true ? pressedBg[intent] : intentBg[intent],
          opacity: disabled ? 0.5 : state.pressed ? 0.9 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {/* The icon rides inside a <Text> for the same reason Button's label
          does: it is the only RN primitive that passes a colour down. An icon
          FONT glyph inherits `color` from here; a react-native-svg icon names
          its own colour and is unaffected, which is the caller's call to make
          — this package ships no icons. */}
      <Text style={[styles.icon, { fontSize: iconText[size], color: intentFg[intent] }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  icon: {
    textAlign: 'center',
  },
});
