// SHARED — no react-native / react-dom / base-ui import. Pure TS + cn().
//
// IconButton is Button with the label taken OUT of the box and moved into the
// accessibility tree: a square target holding one glyph, named by a required
// `label`. What it means by `primary`/`secondary`/`ghost` is IMPORTED from
// button.props rather than restated, so a change of heart about what `ghost`
// looks like moves both controls at once and neither can drift into a second
// opinion.
import type * as React from 'react';

import { intentStyles, type ButtonIntent } from '../button/button.props';
import { cn } from '../lib/cn';
import { disabledStyles, focusRing } from '../lib/styles';

/**
 * Button's three weights of emphasis, plus the one it does not have.
 *
 * WHY `danger` LIVES HERE AND NOT ON BUTTON. `button.props.ts` records the
 * reason it ships no `danger` intent: the semantic token set has no
 * `danger-text` pair, so nothing measured says a LABEL is readable on a danger
 * fill. That reason is about text, and this control has none — its accessible
 * name is `label`, read from the accessibility tree, and the pixels inside the
 * box are a glyph.
 *
 * Measured anyway, because the glyph still has to be visible. `primary-text`
 * is the package's on-fill foreground and it already FLIPS with the scheme
 * (`#FFFFFF` light, `#071B31` dark), which is exactly what a fill that also
 * flips needs — light `danger` is a dark red, dark `danger` a light one:
 *
 *   primary-text on danger   light 5.8:1   dark 6.2:1   ✅
 *   white       on danger    light 5.8:1   dark 2.8:1   ❌ dark
 *
 * The second row is why this pair is not "obviously white": a hard-coded white
 * glyph fails WCAG 1.4.11's 3:1 non-text floor on the dark scheme's lifted red,
 * and would have looked correct to anyone checking only the light canvas.
 *
 * Widening `ButtonIntent` itself would have been the smaller diff and the
 * wrong one: `ButtonIntent` and `buttonClass` are Button's PUBLIC API, so a
 * fourth member makes `<Button intent="danger">` — a text-bearing control —
 * expressible, which is the thing button.props.ts argues against and this
 * component has no standing to overrule.
 */
export type IconButtonIntent = ButtonIntent | 'danger';

/**
 * Square boxes on Button's own height scale: 32dp and 44dp.
 *
 * There is no `lg`. Button's `lg` exists to give a long label room to breathe
 * horizontally, and a square has no label to make room for — `md` is already
 * the WCAG 2.5.5 target-size floor (44dp), so the size above it would be a
 * bigger target than any guideline asks for. `sm` is the same deliberate
 * opt-in to a smaller target that `sizeStyles.sm` documents for Button.
 */
export type IconButtonSize = 'sm' | 'md';

/**
 * The fills. Button's three rows verbatim (imported, not copied), plus danger.
 *
 * `active:bg-danger-hover` rather than a `danger-active`: the token set derives
 * one hovered danger and no pressed one, and inventing a colour here would be
 * exactly the hard-coded value the semantic layer exists to prevent. The
 * pressed feel comes from `pressedStyles` for a toggle, and from the browser's
 * own activation for a one-shot press.
 */
export const iconIntentStyles: Record<IconButtonIntent, string> = {
  ...intentStyles,
  danger: 'bg-danger text-primary-text hover:bg-danger-hover active:bg-danger-hover',
};

/**
 * The extra fill a PRESSED toggle wears — the intent's own pressed colour, held
 * rather than flashed. `cn()`'s twMerge drops the base `bg-*` it conflicts
 * with and leaves the `hover:`/`active:` variants alone, so a pressed control
 * still answers the pointer.
 *
 * `ghost` fills with `bg-line` rather than staying transparent. That is the one
 * row that matters on a dark media surface, where `line` is a translucent white
 * — the pressed state reads as "on" against the media instead of against a
 * background this component cannot see.
 */
export const pressedStyles: Record<IconButtonIntent, string> = {
  primary: 'bg-primary-active',
  secondary: 'bg-line',
  ghost: 'bg-line',
  danger: 'bg-danger-hover',
};

/**
 * Square boxes, matching Button's `h-8`/`h-11` exactly.
 *
 * The `text-*` step sizes the GLYPH, for the two icon shapes that follow font
 * size — an icon-font character, and an SVG sized in `em`. An SVG with its own
 * `width`/`height` ignores it, which is correct: this package ships no icons
 * deliberately, so the caller's icon keeps the last word.
 */
export const iconSizeStyles: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-11 w-11 text-base',
};

/**
 * The props both leaves share.
 *
 * `disabled` is deliberately absent: each leaf inherits its own platform's
 * (`<button disabled>` on web, `PressableProps['disabled']` on native), and
 * declaring it here would collide with the second of those, which types it as
 * `boolean | null | undefined` — the clash `toggle.native.tsx` documents.
 */
export interface IconButtonOwnProps {
  /**
   * The accessible name — REQUIRED, and the whole reason this component is
   * separate from Button.
   *
   * A button whose only child is a glyph has no accessible name unless
   * something supplies one, and `aria-label` is optional on every DOM button
   * type in React, so a plain `<button>` full of `<XIcon />` type-checks and
   * ships nameless. Making it a required prop is what moves "someone
   * remembered" to "it does not compile" — an unlabelled icon button is not
   * representable here.
   *
   * Both leaves put it in the accessibility tree ONLY (web `aria-label`, native
   * `accessibilityLabel`); the web leaf also mirrors it into `title`, so a
   * sighted pointer user gets the same word as the screen-reader one.
   */
  label: string;
  intent?: IconButtonIntent | undefined;
  size?: IconButtonSize | undefined;
  /**
   * Toggle state. OMIT IT ENTIRELY for a one-shot button — the leaves render
   * no `aria-pressed`/`accessibilityState` at all when it is `undefined`,
   * because `aria-pressed="false"` on a control that never toggles announces a
   * toggle that does not exist.
   *
   * This is a CONTROLLED, presentational prop, not a state machine: it has no
   * `defaultPressed` and no `onPressedChange`. A control that owns its own
   * pressed state is `Toggle`, which already has the standalone-or-grouped
   * model — reach for that instead of growing a second copy here.
   */
  pressed?: boolean | undefined;
  /**
   * The icon. Required: an icon button with no icon is an empty square, and
   * nothing downstream can tell that from a missing import.
   */
  children: React.ReactNode;
}

// The `| undefined` on each member is for `exactOptionalPropertyTypes`, the
// same reason `ButtonClassOptions` carries it.
export interface IconButtonClassOptions {
  intent?: IconButtonIntent | undefined;
  size?: IconButtonSize | undefined;
  pressed?: boolean | undefined;
  className?: string | undefined;
}

/**
 * The icon button's Tailwind classes, exported for the same reason
 * `buttonClass` is: a LINK that looks like an icon button (a close affordance
 * that is really an `<a href>`) needs the styling without the `<button>`.
 * Web-only (Tailwind), but string composition is platform-agnostic, so it
 * lives in the shared module.
 *
 * `intent` defaults to `ghost`, where Button defaults to `primary`. An
 * icon-only control is almost always an affordance sitting ON something else —
 * a toolbar, a card corner, a media surface — and a screen of filled squares
 * is not a design. Emphasis is available by asking for it.
 */
export function iconButtonClass({
  intent = 'ghost',
  size = 'md',
  pressed,
  className,
}: IconButtonClassOptions = {}) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-0 font-body no-underline transition-colors',
    focusRing,
    disabledStyles,
    iconIntentStyles[intent],
    iconSizeStyles[size],
    pressed === true && pressedStyles[intent],
    className,
  );
}
