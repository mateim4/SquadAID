import React, { useMemo } from 'react';
import { useStyles } from '@/styles/useStyles';

type AnimatedBackgroundProps = { isDarkTheme: boolean };

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = React.memo(({ isDarkTheme }) => {
    const styles = useStyles();

    const rain = useMemo(() => {
        const dropColor = isDarkTheme ? 'rgba(255, 255, 255, 0.4)' : 'rgba(20, 30, 80, 0.4)';
        return Array.from({ length: 200 }).map((_, i) => (
            <div
                key={`rain-${i}`}
                className={styles.fall}
                style={{
                    position: 'absolute',
                    bottom: '100%',
                    width: '1px',
                    height: '50px',
                    background: `linear-gradient(to bottom, transparent, ${dropColor})`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 1.5 + 0.5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: (Math.random() * 0.5 + 0.2).toString(),
                }}
            />
        ));
    }, [isDarkTheme, styles.fall]);

    const fog = useMemo(() => {
        const fogColor = isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)';
        return Array.from({ length: 15 }).map((_, i) => (
            <div
                key={`fog-${i}`}
                className={styles.moveFog}
                style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    filter: 'blur(70px)',
                    opacity: '0',
                    background: fogColor,
                    width: `${Math.random() * 30 + 30}%`,
                    height: `${Math.random() * 30 + 30}%`,
                    left: `${Math.random() * 80 - 10}%`,
                    top: `${Math.random() * 80 - 10}%`,
                    animationDuration: `${Math.random() * 40 + 30}s`,
                    animationDelay: `${Math.random() * 10}s`,
                }}
            />
        ));
    }, [isDarkTheme, styles.moveFog]);



    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <div style={{ zIndex: 1 }}>{fog}</div>
          <div className={styles.rainbowContainer}>
              <div className={styles.rainbow}></div>
          </div>
          <div className={styles.rainbowSecondaryContainer}>
              <div className={styles.rainbow} style={{ opacity: 0.7 }}></div>
          </div>
          <div style={{ zIndex: 4 }}>{rain}</div>
        </div>
      </div>
    );
});

AnimatedBackground.displayName = 'AnimatedBackground';
