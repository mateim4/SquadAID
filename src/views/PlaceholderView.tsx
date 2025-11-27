import React from 'react';
import { Title3 } from '@fluentui/react-components';
import { useStyles } from '@/styles/useStyles';

export const PlaceholderView: React.FC<{ title: string }> = ({ title }) => {
    const styles = useStyles();
    return (
        <div className={styles.placeholderView}>
            <Title3>This is the {title} view.</Title3>
        </div>
    );
};
