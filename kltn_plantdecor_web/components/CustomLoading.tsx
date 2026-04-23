import * as React from 'react';

export type CustomLoadingProps = {
  /** Size in px (same intent as MUI CircularProgress `size`) */
  size?: number;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Optionally override the default leaf gradient colors */
  color1?: string;
  color2?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const CustomLoading = ({
  size = 24,
  ariaLabel = 'Loading',
  color1,
  color2,
  className,
  style,
}: CustomLoadingProps) => {
  const mergedStyle = React.useMemo(() => {
    type CSSVars = Record<`--${string}`, string>;

    const s: React.CSSProperties & CSSVars = {
      ...(style ?? {}),
      '--leaf-loader-size': `${size}px`,
    };

    if (color1) s['--leaf-loader-color-1'] = color1;
    if (color2) s['--leaf-loader-color-2'] = color2;

    return s;
  }, [style, size, color1, color2]);

  return (
    <div
      className={['leaf-loader', className].filter(Boolean).join(' ')}
      style={mergedStyle}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="leaf-loader__inner" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="leaf-loader__leaf"
            style={{ '--i': i } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

