import React from 'react';
import Layout from '@theme/Layout';
import bookmarksData from '../data/bookmarks.json';
import styles from './bookmarks.module.css';

function Bookmark({ name, url, icon, description }) {
    const defaultIcon = name.charAt(0).toUpperCase();
    const iconStyle = icon
        ? { backgroundImage: `url(${icon})` }
        : { background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' };

    return (
        <a href={url} className={styles.bookmark} target="_blank" rel="noopener noreferrer">
            <div className={styles.icon} style={iconStyle}>
                {!icon && <span className={styles.defaultIcon}>{defaultIcon}</span>}
            </div>
            <div>
                <span className={styles.name}>{name}</span>
                <p className={styles.description}>{description}</p>
            </div>
        </a>
    );
}

function BookmarksPage() {
    const categories = bookmarksData.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {});

    return (
        <Layout title="收藏夹" description="收藏夹页面，展示各类收藏内容">
            <div className={styles.container}>
                <h1>我的收藏夹</h1>
                {Object.keys(categories).map((category) => (
                    <section key={category} className={styles.category}>
                        <h2>{category}</h2>
                        <div className={styles.bookmarksGrid}>
                            {categories[category].map((bookmark, index) => (
                                <Bookmark key={index} {...bookmark} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </Layout>
    );
}

export default BookmarksPage;
