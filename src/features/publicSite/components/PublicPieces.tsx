import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';

import { CONTENT_CATEGORIES, categoryLabel } from '../categories';
import type {
  PublicContentListItem,
  PublicContentRelated,
  PublicFamousListItem,
} from '../types';

export function PublicStateView({
  state,
  message,
  onRetry,
}: {
  state: 'loading' | 'empty' | 'error';
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Card elevation="sm">
      <Stack gap="md" align="center">
        <Text variant="bodyMedium" colorToken="textSecondary">
          {state === 'loading'
            ? '불러오는 중...'
            : (message ??
              (state === 'error'
                ? '콘텐츠를 불러오지 못했습니다.'
                : '표시할 콘텐츠가 없습니다.'))}
        </Text>
        {state === 'error' && onRetry ? (
          <Button label="다시 시도" variant="secondary" onPress={onRetry} />
        ) : null}
      </Stack>
    </Card>
  );
}

export function CategoryChips({ activeSlug }: { activeSlug?: string | null }) {
  return (
    <Stack direction="row" gap="xs" style={{ flexWrap: 'wrap' }}>
      <Link href="/content" asChild>
        <Pressable>
          <Chip label="전체" active={!activeSlug} />
        </Pressable>
      </Link>
      {CONTENT_CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={{ pathname: '/content/category/[slug]', params: { slug: c.slug } }}
          asChild
        >
          <Pressable>
            <Chip label={c.label} active={activeSlug === c.slug} />
          </Pressable>
        </Link>
      ))}
    </Stack>
  );
}

function Chip({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={{ paddingVertical: 4 }}>
      <Text
        variant="bodySmall"
        colorToken={active ? 'textPrimary' : 'textSecondary'}
      >
        {active ? `· ${label}` : label}
      </Text>
    </View>
  );
}

export function PublicContentCard({ item }: { item: PublicContentListItem }) {
  return (
    <Link
      href={{ pathname: '/content/[slug]', params: { slug: item.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}>
        <Card elevation="sm">
          <Stack gap="xs">
            {item.category ? (
              <Text variant="caption" colorToken="textSecondary">
                {categoryLabel(item.category)}
              </Text>
            ) : null}
            <Text variant="headingMedium">{item.title || '(제목 없음)'}</Text>
            {item.summary ? (
              <Text variant="bodySmall" colorToken="textSecondary">
                {item.summary}
              </Text>
            ) : null}
            {item.famousName ? (
              <Text variant="caption" colorToken="textSecondary">
                관련 인물: {item.famousName}
              </Text>
            ) : null}
          </Stack>
        </Card>
      </Pressable>
    </Link>
  );
}

export function PublicFamousCard({ item }: { item: PublicFamousListItem }) {
  return (
    <Link
      href={{ pathname: '/famous/[slug]', params: { slug: item.slug } }}
      asChild
    >
      <Pressable style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}>
        <Card elevation="sm">
          <Stack gap="xs">
            <Text variant="headingMedium">{item.name}</Text>
            {item.occupation ? (
              <Text variant="bodySmall" colorToken="textSecondary">
                {item.occupation}
              </Text>
            ) : null}
            {item.shortDescription ? (
              <Text variant="bodySmall" colorToken="textSecondary">
                {item.shortDescription}
              </Text>
            ) : null}
          </Stack>
        </Card>
      </Pressable>
    </Link>
  );
}

export function RelatedList({ items }: { items: PublicContentRelated[] }) {
  if (items.length === 0) return null;
  return (
    <Stack gap="sm">
      <Text variant="headingMedium">관련 콘텐츠</Text>
      {items.map((r) => (
        <Link
          key={r.slug}
          href={{ pathname: '/content/[slug]', params: { slug: r.slug } }}
          asChild
        >
          <Pressable
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
          >
            <Card elevation="sm">
              <Stack gap="xs">
                <Text variant="bodyMedium">{r.title}</Text>
                {r.summary ? (
                  <Text variant="caption" colorToken="textSecondary">
                    {r.summary}
                  </Text>
                ) : null}
              </Stack>
            </Card>
          </Pressable>
        </Link>
      ))}
    </Stack>
  );
}
