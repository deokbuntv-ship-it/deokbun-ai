// Native fallback for the web inline-SVG LineIcon. The app has no icon library,
// and inline <svg> only renders on web (react-dom). On native we render nothing
// so shared screens keep their prior icon-less look with no crash/regression;
// the polished Stitch icons appear on web, where the visual QA happens.
export type LineIconName =
  | 'wallet'
  | 'briefcase'
  | 'swap'
  | 'heart'
  | 'leaf'
  | 'people'
  | 'gear'
  | 'shield'
  | 'chat'
  | 'sparkle'
  | 'warning'
  | 'calendar'
  | 'send';

type Props = {
  name: LineIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function LineIcon(_props: Props): null {
  return null;
}
