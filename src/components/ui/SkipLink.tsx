/**
 * @file SkipLink.tsx
 * @description Skip link component for keyboard accessibility.
 * Allows keyboard users to skip navigation and go directly to main content.
 */

import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  skipLink: {
    position: 'absolute',
    left: '-9999px',
    zIndex: 999,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    textDecoration: 'none',
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    '&:focus': {
      left: tokens.spacingHorizontalM,
      top: tokens.spacingVerticalM,
      outline: `2px solid ${tokens.colorBrandStroke1}`,
      outlineOffset: '2px',
    },
  },
});

export interface SkipLinkProps {
  /** ID of the main content element to skip to */
  targetId?: string;
  /** Custom label for the skip link */
  label?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const styles = useStyles();

  return (
    <a href={`#${targetId}`} className={styles.skipLink}>
      {label}
    </a>
  );
};

export default SkipLink;
