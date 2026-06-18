export type TrendState = 'up' | 'down' | 'steady';

export type TrendRange = {
  up: number;
  down: number;
};

export type TrendThresholdConfig = {
  client: {
    completion: TrendRange;
    spend: TrendRange;
    quality: TrendRange;
    onTime: TrendRange;
  };
  worker: {
    winRate: TrendRange;
    responseRate: TrendRange;
    repeatClients: TrendRange;
    rating: TrendRange;
  };
  admin: {
    activeUsers: TrendRange;
    activeProjects: TrendRange;
    marketplaceRating: TrendRange;
  };
};

const STORAGE_KEY = 'kalide.performance.trend-thresholds';

export const DEFAULT_TREND_THRESHOLDS: TrendThresholdConfig = {
  client: {
    completion: { up: 60, down: 30 },
    spend: { up: 80, down: 40 },
    quality: { up: 4, down: 3 },
    onTime: { up: 80, down: 60 },
  },
  worker: {
    winRate: { up: 60, down: 30 },
    responseRate: { up: 80, down: 50 },
    repeatClients: { up: 2, down: 0 },
    rating: { up: 4, down: 3 },
  },
  admin: {
    activeUsers: { up: 70, down: 40 },
    activeProjects: { up: 60, down: 30 },
    marketplaceRating: { up: 4, down: 3 },
  },
};

export const TREND_BADGE_CLASSES: Record<TrendState, string> = {
  up: 'bg-green-500/20 text-green-300 border-green-500/30',
  down: 'bg-red-500/20 text-red-300 border-red-500/30',
  steady: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export const getTrendByThreshold = (value: number, up: number, down: number): TrendState => {
  if (value >= up) return 'up';
  if (value <= down) return 'down';
  return 'steady';
};

export const getPresenceTrend = (value: number): TrendState => (value > 0 ? 'up' : 'steady');

export const getRatioPercent = (value: number, total: number): number => {
  if (total <= 0) return 0;
  return (value / total) * 100;
};

export const getTrendThresholds = (): TrendThresholdConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_TREND_THRESHOLDS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_TREND_THRESHOLDS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TrendThresholdConfig>;
    return {
      client: {
        completion: parsed.client?.completion ?? DEFAULT_TREND_THRESHOLDS.client.completion,
        spend: parsed.client?.spend ?? DEFAULT_TREND_THRESHOLDS.client.spend,
        quality: parsed.client?.quality ?? DEFAULT_TREND_THRESHOLDS.client.quality,
        onTime: parsed.client?.onTime ?? DEFAULT_TREND_THRESHOLDS.client.onTime,
      },
      worker: {
        winRate: parsed.worker?.winRate ?? DEFAULT_TREND_THRESHOLDS.worker.winRate,
        responseRate: parsed.worker?.responseRate ?? DEFAULT_TREND_THRESHOLDS.worker.responseRate,
        repeatClients: parsed.worker?.repeatClients ?? DEFAULT_TREND_THRESHOLDS.worker.repeatClients,
        rating: parsed.worker?.rating ?? DEFAULT_TREND_THRESHOLDS.worker.rating,
      },
      admin: {
        activeUsers: parsed.admin?.activeUsers ?? DEFAULT_TREND_THRESHOLDS.admin.activeUsers,
        activeProjects: parsed.admin?.activeProjects ?? DEFAULT_TREND_THRESHOLDS.admin.activeProjects,
        marketplaceRating: parsed.admin?.marketplaceRating ?? DEFAULT_TREND_THRESHOLDS.admin.marketplaceRating,
      },
    };
  } catch {
    return DEFAULT_TREND_THRESHOLDS;
  }
};

export const setTrendThresholds = (config: TrendThresholdConfig): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};
