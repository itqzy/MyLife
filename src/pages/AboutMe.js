import React from 'react';
import Layout from '@theme/Layout';

export default function Hello() {
    return (
        <Layout title="Hello" description="Hello React Page">
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    fontSize: '20px',
                }}>
                <h1>
                    这是关于我页面，待开发
                </h1>
            </div>
        </Layout>
    );
}