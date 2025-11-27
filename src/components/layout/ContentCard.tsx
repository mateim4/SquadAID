import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import React from 'react';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.padding('16px'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
    height: '100%',
    boxSizing: 'border-box',
  },
});

interface ContentCardProps {
  children: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.card}>{children}</div>;
};

export default ContentCard;
