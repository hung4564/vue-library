import React, { useMemo } from 'react';

export interface MapImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  children?: React.ReactNode;
}

export function MapImage({
  src,
  children,
  className = '',
  style,
  ...props
}: MapImageProps) {
  const styleImage = useMemo(() => {
    if (!src) {
      return {};
    }
    return {
      backgroundImage: `url(${src})`,
    };
  }, [src]);

  return (
    <div className={`map-image ${className}`} style={style} {...props}>
      <div className="map-image__sizer" style={{ paddingBottom: '100%' }}></div>
      <div className="map-image__image" style={styleImage}></div>
      <div className="map-image__content">{children}</div>
    </div>
  );
}
