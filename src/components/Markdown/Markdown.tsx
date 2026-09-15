import { Fragment, createContext, useContext, type ReactNode } from 'react';
import { Linking, View } from 'react-native';

import { Text } from '@/components/Text';
import { Spacing } from '@/constants/theme';
import type { TypographyToken } from '@/theme';

// Dependency-free, SAFE Markdown renderer for public article content.
// LINE-BASED parser: headings (#/##/###), paragraphs, unordered (-,*) and ordered
// (1.) lists, blockquotes (>), horizontal rules, inline **bold** / *italic* /
// `code` / [text](https link). Groups consecutive list/paragraph lines even when a
// heading is immediately followed by a list without a blank line (real AI output).
// It NEVER renders raw HTML and only opens http(s) links (no injection).

type InlineNode =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'italic'; v: string }
  | { t: 'code'; v: string }
  | { t: 'link'; v: string; url: string };

// DESIGN_FREEZE_FINAL C11 — the SAME safe renderer serves both the compact body (bodyMedium) and the
// long-form 해석 reading measure (reading 16/28). One parser, one escaping story; only the type scale
// changes, injected here so no call site has to re-implement Markdown.
const BodyVariant = createContext<TypographyToken>('bodyMedium');

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
  if (/^https?:\/\//.test(url)) {
    Linking.openURL(url).catch(() => {});
  }
}

function InlineText({ text }: { text: string }) {
  const nodes = parseInline(text);
  const bv = useContext(BodyVariant);
  return (
    <Text variant={bv}>
      {nodes.map((n, idx) => {
        if (n.t === 'bold') {
          return (
            <Text key={idx} variant={bv} style={{ fontWeight: '700' }}>
              {n.v}
            </Text>
          );
        }
        if (n.t === 'italic') {
          return (
            <Text key={idx} variant={bv} style={{ fontStyle: 'italic' }}>
              {n.v}
            </Text>
          );
        }
        if (n.t === 'code') {
          return (
            <Text key={idx} variant="bodySmall" style={{ fontFamily: 'monospace' }}>
              {n.v}
            </Text>
          );
        }
        if (n.t === 'link') {
          return (
            <Text
              key={idx}
              variant={bv}
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

function Heading({ level, text }: { level: number; text: string }) {
  const variant =
    level === 1 ? 'headingLarge' : level === 2 ? 'headingMedium' : 'bodyLarge';
  return (
    <Text variant={variant} style={level >= 3 ? { fontWeight: '700' } : undefined}>
      {text}
    </Text>
  );
}

function ListBlock({ items, ordered }: { items: string[]; ordered: boolean }) {
  const bv = useContext(BodyVariant);
  return (
    <View style={{ gap: Spacing.one }}>
      {items.map((l, idx) => (
        <View key={idx} style={{ flexDirection: 'row', gap: Spacing.two }}>
          <Text variant={bv}>{ordered ? `${idx + 1}.` : '•'}</Text>
          <View style={{ flex: 1 }}>
            <InlineText text={l} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Hr() {
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

export function Markdown({ source, reading = false }: { source: string; reading?: boolean }) {
  const bv: TypographyToken = reading ? 'reading' : 'bodyMedium';
  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let ul: string[] = [];
  let ol: string[] = [];
  let quote: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(<InlineText key={key++} text={para.join('\n')} />);
      para = [];
    }
  };
  const flushUl = () => {
    if (ul.length) {
      blocks.push(<ListBlock key={key++} items={ul} ordered={false} />);
      ul = [];
    }
  };
  const flushOl = () => {
    if (ol.length) {
      blocks.push(<ListBlock key={key++} items={ol} ordered />);
      ol = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push(
        <View
          key={key++}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: 'rgba(128,128,128,0.4)',
            paddingLeft: Spacing.three,
          }}
        >
          <Text variant={bv} colorToken="textSecondary">
            {quote.join('\n')}
          </Text>
        </View>,
      );
      quote = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushUl();
    flushOl();
    flushQuote();
  };

  for (const raw of lines) {
    const t = raw.trim();
    if (t === '') {
      flushAll();
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      flushAll();
      blocks.push(<Hr key={key++} />);
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      flushAll();
      blocks.push(<Heading key={key++} level={h[1].length} text={h[2]} />);
      continue;
    }
    if (/^\s*[-*]\s+/.test(raw)) {
      flushPara();
      flushOl();
      flushQuote();
      ul.push(raw.replace(/^\s*[-*]\s+/, ''));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(raw)) {
      flushPara();
      flushUl();
      flushQuote();
      ol.push(raw.replace(/^\s*\d+\.\s+/, ''));
      continue;
    }
    if (/^\s*>\s?/.test(raw)) {
      flushPara();
      flushUl();
      flushOl();
      quote.push(raw.replace(/^\s*>\s?/, ''));
      continue;
    }
    // Paragraph line (soft-wrapped; consecutive lines join).
    flushUl();
    flushOl();
    flushQuote();
    para.push(raw);
  }
  flushAll();

  return (
    <BodyVariant.Provider value={bv}>
      <View style={{ gap: Spacing.three }}>{blocks}</View>
    </BodyVariant.Provider>
  );
}
