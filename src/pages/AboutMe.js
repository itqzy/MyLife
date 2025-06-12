import React from 'react';
import Layout from '@theme/Layout';

export default function AboutMe() {
    return (
        <Layout title="关于我" description="个人介绍页面">
            <div className="container">
                <div
                    style={{
                        padding: '2rem',
                        maxWidth: '960px',
                        margin: '0 auto',
                    }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>个人简介</h1>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2>👨‍💻 基本信息</h2>
                        <p>我是一名专注于Java开发的软件工程师，热衷于编写高质量的代码和构建可靠的企业级应用。</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2>🛠 技术栈</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            {[
                                { name: 'Java', level: '精通' },
                                { name: 'Spring Boot', level: '熟练' },
                                { name: 'Spring Cloud', level: '熟练' },
                                { name: 'MySQL', level: '熟练' },
                                { name: 'Redis', level: '熟练' },
                                { name: 'Maven', level: '熟练' },
                                { name: 'Git', level: '熟练' },
                                { name: 'Docker', level: '熟练' }
                            ].map((skill, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '1rem',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                    <div style={{ fontWeight: 'bold' }}>{skill.name}</div>
                                    <div style={{ color: '#666' }}>{skill.level}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h2>🎯 专业方向</h2>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            <li style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                ✨ 企业级Java应用开发
                            </li>
                            <li style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                ✨ 分布式系统设计与实现
                            </li>
                            <li style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                ✨ 高性能、高可用系统架构
                            </li>
                            <li style={{ margin: '0.5rem 0', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                ✨ 微服务架构设计与开发
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2>📫 联系方式</h2>
                        <p>如果您对我的工作感兴趣，欢迎通过以下方式联系我：</p>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            flexDirection: 'column'
                        }}>
                            <span>💼 GitHub：<a href="https://github.com/itqzy">itqzy</a></span>
                            <span>📧 邮箱：allen.coder2017@gmail.com </span>

                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}