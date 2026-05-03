import styles from '../../styles/Guarantee.module.css';

const warrantyPoints = [
  {
    title: 'Офіційна гарантія',
    text: 'На більшість товарів у нашому магазині діє офіційна гарантія від виробника або гарантія магазину відповідно до категорії товару.',
  },
  {
    title: 'Перевірка перед відправкою',
    text: 'Ми перевіряємо комплектацію, зовнішній стан та базову працездатність товару перед відправленням, щоб зменшити ризик неприємних ситуацій.',
  },
  {
    title: 'Підтримка після покупки',
    text: 'Якщо у вас виникли питання щодо роботи товару, сумісності або гарантійного випадку — наша команда допоможе розібратися та підкаже подальші дії.',
  },
  {
    title: 'Зрозумілі умови',
    text: 'Ми прагнемо, щоб усі умови гарантії були прозорими: без прихованих пунктів, складних формулювань і зайвої бюрократії.',
  },
];

const warrantyTerms = [
  'Зберігайте чек, накладну або інший документ, що підтверджує покупку.',
  'Не пошкоджуйте заводські пломби, серійні наклейки та комплект постачання.',
  'Дотримуйтесь рекомендацій виробника щодо встановлення та експлуатації.',
  'У разі несправності зверніться до нас перед самостійним ремонтом або розбиранням.',
];

const noWarrantyCases = [
  'Механічні пошкодження, сліди ударів, падіння або потрапляння рідини.',
  'Сліди самостійного ремонту, пайки, втручання в конструкцію або пошкоджені пломби.',
  'Неправильне підключення, експлуатація з порушенням технічних вимог або перевищення допустимих навантажень.',
  'Природний знос витратних матеріалів або проблеми, не пов’язані з виробничим дефектом.',
];

const steps = [
  'Зв’яжіться з нами та коротко опишіть проблему.',
  'Підготуйте фото, відео або опис несправності — це пришвидшить перевірку.',
  'Передайте товар на діагностику відповідно до наших рекомендацій.',
  'Після перевірки ми повідомимо рішення: ремонт, заміна, сервісний висновок або інший варіант згідно з умовами.',
];

function Warranty() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>ZYNK STORE</span>
            <h1 className={styles.title}>Гарантія</h1>
            <p className={styles.subtitle}>
              Ми дбаємо про те, щоб покупка комплектуючих і техніки була не лише
              вигідною, а й безпечною. Тому пропонуємо зрозумілі гарантійні умови
              та підтримку на всіх етапах після замовлення.
            </p>

            <div className={styles.heroActions}>
              <a href="/contacts" className={styles.primaryButton}>
                Звернутися щодо гарантії
              </a>
              <a href="/catalog" className={styles.secondaryButton}>
                Перейти до каталогу
              </a>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardLabel}>Коротко про головне</div>
            <ul className={styles.heroList}>
              <li>Офіційна гарантія або гарантія магазину</li>
              <li>Підтримка при зверненні та діагностиці</li>
              <li>Прозорі правила без зайвих складнощів</li>
              <li>Допомога з гарантійними питаннями після покупки</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.pointsSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ЩО МИ ГАРАНТУЄМО</span>
          <h2>Надійний сервіс і зрозумілі правила</h2>
        </div>

        <div className={styles.pointsGrid}>
          {warrantyPoints.map((item, index) => (
            <article key={item.title} className={styles.pointCard}>
              <div className={styles.pointNumber}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <span className={styles.sectionKicker}>ВАЖЛИВО ЗНАТИ</span>
            <h2>Що потрібно для гарантійного звернення</h2>
            <ul className={styles.list}>
              {warrantyTerms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.darkCard}>
            <span className={styles.darkCardLabel}>Гарантія може не діяти, якщо:</span>
            <ul className={styles.darkList}>
              {noWarrantyCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.stepsSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ЯК ЦЕ ПРАЦЮЄ</span>
          <h2>Порядок гарантійного звернення</h2>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((item, index) => (
            <div key={item} className={styles.stepCard}>
              <div className={styles.stepIndex}>{index + 1}</div>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <span className={styles.sectionKicker}>ПОТРІБНА ДОПОМОГА</span>
            <h2>Маєш питання щодо гарантії?</h2>
            <p>
              Напиши нам, і ми підкажемо, як правильно оформити звернення,
              підготувати товар до перевірки та що робити далі у твоїй ситуації.
            </p>
          </div>

          <a href="/contacts" className={styles.primaryButton}>
            Зв’язатися з нами
          </a>
        </div>
      </section>
    </main>
  );
}

export default Warranty;
