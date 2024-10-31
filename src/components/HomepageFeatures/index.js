import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '知识库',
    Svg: require('@site/static/img/organizing_files2.svg').default,
    description: (
      <>
        这里汇集了我在开发中积累的<code>知识点</code>与<code>实用技巧</code>，帮助我在项目中快速查找和应用相关技术，持续提升专业技能。
      </>
    ),
  },
  {
    title: '收藏夹',
    Svg: require('@site/static/img/a_person_taking_notes.svg').default,
    description: (
      <>
        这是一个多样化的网站收藏集，包含各类<code>在线服务</code>、<code>有趣的网站</code>等，方便随时找到和探索有用的资源。
      </>
    ),
  },
  {
    title: '一些思考',
    Svg: require('@site/static/img/writing_notes.svg').default,
    description: (
      <>
        在这里，我记录了一些生活与工作的<code>思考</code>和<code>感悟</code>，既有长文分析，也有像朋友圈一样的随手短记，记录心路历程和灵感瞬间。
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
