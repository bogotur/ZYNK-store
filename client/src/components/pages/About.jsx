import styles from '../../styles/About.module.css';

const advantages = [
  {
    title: 'Перевірені комплектуючі',
    text: 'Працюємо з актуальними комплектуючими для ігрових, робочих і професійних ПК — від бюджетних рішень до топових конфігурацій.',
  },
  {
    title: 'Консультація без зайвих слів',
    text: 'Допомагаємо підібрати процесор, відеокарту, пам’ять, накопичувачі та периферію під конкретні задачі й бюджет.',
  },
  {
    title: 'Гарантія та сервіс',
    text: 'Ми цінуємо довіру клієнтів, тому надаємо офіційну гарантію, підтримку після покупки та зрозумілі умови обслуговування.',
  },
  {
    title: 'Збірка та апгрейд',
    text: 'Підкажемо сумісність компонентів, порадимо оптимальний апгрейд і допоможемо зібрати систему без компромісів.',
  },
];

const categories = [
  'Відеокарти',
  'Процесори',
  'Материнські плати',
  'Оперативна пам’ять',
  'SSD та накопичувачі',
  'Блоки живлення',
  'Охолодження',
  'Корпуси та периферія',
];

const stats = [
  { value: '5000+', label: 'товарів у каталозі' },
  { value: '1000+', label: 'задоволених клієнтів' },
  { value: '24/7', label: 'онлайн-підтримка' },
  { value: '100%', label: 'фокус на якості' },
];

function About() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>ZYNK STORE</span>
            <h1 className={styles.title}>Про нас</h1>
            <p className={styles.subtitle}>
              Ми — магазин комп’ютерних комплектуючих і периферії для тих, хто
              хоче зібрати надійну систему, оновити свій ПК або знайти техніку,
              яка реально відповідає задачам.
            </p>

            <div className={styles.heroActions}>
              <a href="/catalog" className={styles.primaryButton}>
                Перейти до каталогу
              </a>
              <a href="/contacts" className={styles.secondaryButton}>
                Зв’язатися з нами
              </a>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.cardGlow}></div>
            <div className={styles.specLabel}>Наш підхід</div>
            <ul className={styles.specList}>
              <li>Тільки актуальні комплектуючі</li>
              <li>Чесна консультація без нав’язування</li>
              <li>Підбір під ігри, роботу та навчання</li>
              <li>Офіційна гарантія та підтримка</li>
              <li>Допомога з апгрейдом і сумісністю</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((item) => (
            <div key={item.label} className={styles.statCard}>
              <div className={styles.statValue}>{item.value}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ХТО МИ</span>
          <h2>Техніка, підібрана з розумом</h2>
        </div>

        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <p>
              ZYNK — це простір для тих, хто цінує продуктивність, надійність і
              сучасний підхід до вибору техніки. Ми спеціалізуємося на продажі
              комп’ютерних комплектуючих, периферії та рішень для апгрейду.
            </p>
            <p>
              Для нас важливо не просто продати товар, а допомогти знайти саме
              те рішення, яке підійде під ваші задачі: кіберспорт, монтаж,
              дизайн, програмування, стримінг або щоденну роботу.
            </p>
            <p>
              Ми слідкуємо за ринком, актуальними новинками та сумісністю
              комплектуючих, щоб ви отримували не випадковий набір деталей, а
              дійсно збалансовану систему.
            </p>
          </div>

          <div className={styles.categoryBox}>
            <h3>Що у нас можна знайти</h3>
            <div className={styles.categoryList}>
              {categories.map((item) => (
                <span key={item} className={styles.categoryItem}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.advantagesSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ЧОМУ ОБИРАЮТЬ НАС</span>
          <h2>Сильні сторони магазину</h2>
        </div>

        <div className={styles.advantagesGrid}>
          {advantages.map((item, index) => (
            <article key={item.title} className={styles.advantageCard}>
              <div className={styles.advantageNumber}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <span className={styles.sectionKicker}>ГОТОВІ ДОПОМОГТИ</span>
            <h2>Підберемо комплектуючі під ваші задачі</h2>
            <p>
              Якщо не знаєте, з чого почати — ми допоможемо підібрати компоненти,
              перевірити сумісність і знайти оптимальний варіант під ваш бюджет.
            </p>
          </div>

          <a href="/contacts" className={styles.primaryButton}>
            Отримати консультацію
          </a>
        </div>
      </section>
    </main>
  );
}

export default About;
