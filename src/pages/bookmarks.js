import React, { useMemo, useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import bookmarksData from '../data/bookmarks.json';
import styles from './bookmarks.module.css';

const SearchIcon = () => (
    <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const Bookmark = React.memo(({ name, url, description }) => (
    <a
        href={url}
        className={styles.bookmark}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`访问 ${name}`}
    >
        <div>
            <span className={styles.name}>{name}</span>
            <p className={styles.description}>{description}</p>
        </div>
    </a>
));

Bookmark.displayName = 'Bookmark';

const CategoryNav = ({ categories, activeCategory, onCategoryClick }) => (
    <nav className={styles.categoryNav}>
        <div className={styles.categoryList}>
            {categories.map(([category]) => (
                <a
                    key={category}
                    href={`#${category}`}
                    className={`${styles.categoryLink} ${activeCategory === category ? styles.active : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        onCategoryClick(category);
                    }}
                >
                    {category}
                </a>
            ))}
        </div>
    </nav>
);

function BookmarksPage() {
    const [activeCategory, setActiveCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => {
        const categoryMap = new Map();

        bookmarksData.forEach(item => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, []);
            }
            categoryMap.get(item.category).push(item);
        });

        return categoryMap;
    }, []);

    const filteredCategories = useMemo(() => {
        if (!searchQuery) {
            return Array.from(categories.entries());
        }

        const query = searchQuery.toLowerCase();
        return Array.from(categories.entries())
            .map(([category, bookmarks]) => [
                category,
                bookmarks.filter(
                    bookmark =>
                        bookmark.name.toLowerCase().includes(query) ||
                        bookmark.description.toLowerCase().includes(query)
                )
            ])
            .filter(([, bookmarks]) => bookmarks.length > 0);
    }, [categories, searchQuery]);

    const scrollToCategory = (category) => {
        const element = document.getElementById(category);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveCategory(category);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const categories = document.querySelectorAll('[id]');
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            for (const category of categories) {
                const element = category;
                const elementTop = element.offsetTop;
                const elementBottom = elementTop + element.offsetHeight;

                if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
                    setActiveCategory(element.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // 初始化时执行一次
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!bookmarksData.length) {
        return (
            <Layout title="收藏夹" description="收藏夹页面，归档各类网站">
                <div className={styles.container}>
                    <h1>我的收藏夹</h1>
                    <div className={styles.emptyState}>
                        暂无收藏内容
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="收藏夹" description="收藏夹页面，归档各类网站">
            <div className={styles.container}>
                <h1>我的收藏夹</h1>

                <div className={styles.searchContainer}>
                    <SearchIcon />
                    <input
                        type="search"
                        className={styles.searchInput}
                        placeholder="搜索书签..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <CategoryNav
                    categories={filteredCategories}
                    activeCategory={activeCategory}
                    onCategoryClick={scrollToCategory}
                />

                {filteredCategories.length === 0 ? (
                    <div className={styles.noResults}>
                        没有找到匹配的书签
                    </div>
                ) : (
                    filteredCategories.map(([category, bookmarks]) => (
                        <section id={category} key={category} className={styles.category}>
                            <h2>{category}</h2>
                            <div className={styles.bookmarksGrid}>
                                {bookmarks.map((bookmark, index) => (
                                    <Bookmark
                                        key={`${category}-${bookmark.name}-${index}`}
                                        {...bookmark}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </Layout>
    );
}

export default BookmarksPage;
