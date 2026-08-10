import { Fragment } from 'react';
import { Linking, View } from 'react-native';

import { Text } from '@/components/Text';
import { Spacing } from '@/constants/theme';

// Dependency-free, SAFE Markdown renderer for public article content.
// Supports a deliberately limited subset: headings (#/##/###), paragraphs,
// unordered (-,*) and ordered (1.) lists, blockquotes (>), horizontal rules,
// inline **bold** / *italic* / `code` / [text](https link). It NEVER renders raw
// HTML (no dangerouslySetInnerHTML equivalent) and only opens http(s) links, so
// AI/operator-authored markup cannot inject markup or unsafe schemes.

type InlineNode =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; v: string; url: string };

const LINK_RE = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buf = '';
  let i = 0;
  const flush = () => {
    if (buf.length > 0) {
      nodes.push({ t: 'text', v: buf });
      buf = '';
    }
  };
  while (i < text.length) {
    const rest = text.slice(i);
    const link = LINK_RE.exec(rest);
    if (link) {
      flush();
      nodes.push({ t: 'link', v: link[1], url: link[2] });
      i += link[0].length;
      continue;
    }
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        flush();
        nodes.push({ t: 'bold', v: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (text[i] === '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        flush();
        nodes.push({ t: 'italic', v: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        nodes.push({ t: 'code', v: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i += 1;
  }
  flush();
  return nodes;
}

function openLink(url: string) {
  // Only http(s) reaches here (enforced by LINK_RE). Guard again defensively.
  if (/^https?:\/\//.test(url)) {
    Linking.openURL(url).catch(() => {
      /* ignore */
    });
  }
}

function InlineText({ text }: { text: string }) {
  const nodes = parseInline(text);
  return (
    <Text variant="bodyMedium">
      {nodes.map((n, idx) => {
        if (n.t === 'bold') {
          return (
            <Text key={idx} variant="bodyMedium" style={{ fontWeight: '700' }}>
              {n.v}
            </Text>
          );
        }
        if (n.t === 'italic') {
          return (
            <Text key={idx} variant="bodyMedium" style={{ fontStyle: 'italic' }}>
              {n.v}
            </Text>
          );
        }
        if (n.t === 'code') {
          return (
            <Text
              key={idx}
              variant="bodySmall"
              style={{ fontFamily: 'monospace' }}
            >
              {n.v}
            </Text>
          );
        }
        if (n.t === 'link') {
          return (
            <Text
              key={idx}
              variant="bodyMedium"
              colorToken="primary"
              onPress={() => openLink(n.url)}
            >
              {n.v}
            </Text>
          );
        }
        return <Fragment key={idx}>{n.v}</Fragment>;
      })}
    </Text>
  );
}

function isUnorderedList(lines: string[]): boolean {
  return lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
}
function isOrderedList(lines: string[]): boolean {
  return lines.length > 0 && lines.every((l) => /^\s*\d+\.\s+/.test(l));
}

function Block({ raw }: { raw: string }) {
  const block = raw.trim();
  if (block.length === 0) return null;

  // Horizontal rule
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(block)) {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(128,128,128,0.35)',
          marginVertical: Spacing.two,
        }}
      />
    );
  }

  // Headings
  const heading = /^(#{1,3})\s+(.*)$/.exec(block);
  if (heading) {
    const level = heading[1].length;
    const variant =
      level === 1 ? 'headingLarge' : level === 2 ? 'headingMedium' : 'bodyLarge';
    return (
      <Text variant={variant} style={level === 3 ? { fontWeight: '700' } : undefined}>
        {heading[2]}
      </Text>
    );
  }

  // Blockquote
  if (block.split('\n').every((l) => /^\s*>\s?/.test(l))) {
    const quote = block
      .split('\n')
      .map((l) => l.replace(/^\s*>\s?/, ''))
      .join('\n');
    return (
      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: 'rgba(128,128,128,0.4)',
          paddingLeft: Spacing.three,
        }}
      >
        <Text variant="bodyMedium" colorToken="textSecondary">
          {quote}
        </Text>
      </View>
    );
  }

  const lines = block.split('\n');

  // Unordered list
  if (isUnorderedList(lines)) {
    return (
      <View style={{ gap: Spacing.one }}>
        {lines.map((l, idx) => (
          <View key={idx} style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Text variant="bodyMedium">•</Text>
            <View style={{ flex: 1 }}>
              <InlineText text={l.replace(/^\s*[-*]\s+/, '')} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Ordered list
  if (isOrderedList(lines)) {
    return (
      <View style={{ gap: Spacing.one }}>
        {lines.map((l, idx) => (
          <View key={idx} style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Text variant="bodyMedium">{idx + 1}.</Text>
            <View style={{ flex: 1 }}>
              <InlineText text={l.replace(/^\s*\d+\.\s+/, '')} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Paragraph (single newlines kept as soft breaks)
  return <InlineText text={block} />;
}

export function Markdown({ source }: { source: string }) {
  const normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n{2,}/);
  return (
    <View style={{ gap: Spacing.three }}>
      {blocks.map((b, idx) => (
        <Block key={idx} raw={b} />
      ))}
    </View>
  );
}
