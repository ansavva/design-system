import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { View } from 'react-native';

import { IconButton as IconButtonWeb } from '@design-system/icon-button/icon-button.web.tsx';
import { IconButton as IconButtonNative } from '@design-system/icon-button/icon-button.native.tsx';
import type {
  IconButtonIntent,
  IconButtonSize,
} from '@design-system/icon-button/icon-button.props.ts';

import { LeafPair, pair } from './leaf-pair.tsx';

// Four intents, not Button's three: `danger` exists HERE because an icon
// button carries no text — icon-button.props.ts holds the measured contrast
// argument. `satisfies` ties the list to the type, per button.stories.tsx's
// 0.8.3 lesson.
const INTENTS = ['primary', 'secondary', 'ghost', 'danger'] as const satisfies readonly IconButtonIntent[];
const SIZES = ['sm', 'md'] as const satisfies readonly IconButtonSize[];

/**
 * The glyph is a text character on purpose. The package ships no icons — the
 * icon arrives as children — and a character exercises both leaves' real
 * contract: the web leaf renders children into the button, the native leaf
 * wraps them in the `<Text>` that passes the intent's foreground colour down.
 * An SVG would name its own colour and hide a broken seam.
 */
const GLYPH = '♥';

type IconButtonArgs = {
  label: string;
  intent: IconButtonIntent;
  size: IconButtonSize;
  disabled: boolean;
  /** The glyph. A string arg so the Controls panel can swap it. */
  children: string;
  onPress: () => void;
};

const meta = {
  title: 'Forms/IconButton',
  component: IconButtonWeb,
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Favorite',
    intent: 'ghost',
    size: 'md',
    disabled: false,
    children: GLYPH,
    onPress: fn(),
  },
  argTypes: {
    intent: { control: 'inline-radio', options: [...INTENTS] },
    size: { control: 'inline-radio', options: [...SIZES] },
  },
  render: (args) => (
    <LeafPair
      web={
        <IconButtonWeb
          label={args.label}
          intent={args.intent}
          size={args.size}
          disabled={args.disabled}
          onClick={args.onPress}
        >
          {args.children}
        </IconButtonWeb>
      }
      native={
        <IconButtonNative
          label={args.label}
          intent={args.intent}
          size={args.size}
          disabled={args.disabled}
          onPress={args.onPress}
        >
          {args.children}
        </IconButtonNative>
      }
    />
  ),
} satisfies Meta<IconButtonArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The wiring proof: the accessible name comes from `label` (the glyph is not
 * the name), and one press per leaf reaches the shared handler.
 */
export const Basic: Story = {
  play: async ({ canvasElement, args, step }) => {
    const { web, native } = pair(canvasElement);
    await step('web leaf is named by label and fires', async () => {
      await userEvent.click(web.getByRole('button', { name: args.label }));
      await expect(args.onPress).toHaveBeenCalledTimes(1);
    });
    await step('native leaf is named by the same label and fires', async () => {
      await userEvent.click(native.getByRole('button', { name: args.label }));
      await expect(args.onPress).toHaveBeenCalledTimes(2);
    });
  },
};

export const Intents: Story = {
  render: () => (
    <LeafPair
      web={
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {INTENTS.map((intent) => (
            <IconButtonWeb key={intent} label={intent} intent={intent}>
              {GLYPH}
            </IconButtonWeb>
          ))}
        </div>
      }
      native={
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          {INTENTS.map((intent) => (
            <IconButtonNative key={intent} label={intent} intent={intent}>
              {GLYPH}
            </IconButtonNative>
          ))}
        </View>
      }
    />
  ),
};

/**
 * A toggle: `pressed` is controlled and presentational (Toggle owns the state
 * machine — see icon-button.props.ts), so the story holds the state the way a
 * consumer would. The play asserts the half of the contract a screenshot
 * cannot: `aria-pressed` present on a toggle, absent on the plain buttons
 * above, and flipping with the press.
 */
export const Toggled: Story = {
  render: function ToggledStory(args) {
    const [pressed, setPressed] = React.useState(true);
    return (
      <LeafPair
        web={
          <IconButtonWeb
            label={args.label}
            intent={args.intent}
            size={args.size}
            pressed={pressed}
            onClick={() => setPressed((value) => !value)}
          >
            {GLYPH}
          </IconButtonWeb>
        }
        native={
          <IconButtonNative
            label={args.label}
            intent={args.intent}
            size={args.size}
            pressed={pressed}
            onPress={() => setPressed((value) => !value)}
          >
            {GLYPH}
          </IconButtonNative>
        }
      />
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const { web } = pair(canvasElement);
    const button = web.getByRole('button', { name: args.label });
    await step('starts pressed', async () => {
      await expect(button).toHaveAttribute('aria-pressed', 'true');
    });
    await step('a press releases it', async () => {
      await userEvent.click(button);
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  },
};
