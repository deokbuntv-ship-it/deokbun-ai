import { getSupabaseClient } from '@/services/supabase';

import type {
  PublicationChannel,
  ProviderConnection,
  ProviderConnectionStatus,
} from '../types';

// Read channel connection STATUS (public.provider_connections, admin RLS). Never
// exposes tokens (tokens live server-side only). Fail-closed: any error or missing
// row → 'not_connected'.

const TABLE = 'provider_connections';

async function getStatus(
  channel: PublicationChannel,
): Promise<ProviderConnection> {
  const fallback: ProviderConnection = {
    channel,
    status: 'not_connected',
    externalAccountName: null,
    connectedAt: null,
  };
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('channel, status, external_account_name, connected_at')
      .eq('channel', channel)
      .maybeSingle();
    if (error || data === null) return fallback;
    const row = data as Record<string, unknown>;
    const status = row.status;
    return {
      channel,
      status:
        status === 'connected' || status === 'expired' || status === 'error'
          ? (status as ProviderConnectionStatus)
          : 'not_connected',
      externalAccountName:
        typeof row.external_account_name === 'string'
          ? row.external_account_name
          : null,
      connectedAt:
        typeof row.connected_at === 'string' ? row.connected_at : null,
    };
  } catch {
    return fallback;
  }
}

export const providerConnectionService = { getStatus };
