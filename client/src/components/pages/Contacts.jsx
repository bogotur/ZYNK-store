import styles from '../../styles/Contacts.module.css';

const contactCards = [
  {
    title: 'Телефон',
    value: '+38 (097) 333-45-42',
    note: 'Пн–Пт: 9:00–18:00 · Сб–Нд: 10:00–17:00',
    action: 'tel:+380973334542',
    actionLabel: 'Зателефонувати',
  },
  {
    title: 'Email',
    value: 'support@zynkstore.ua',
    note: 'Для консультацій, замовлень і гарантійних звернень',
    action: 'mailto:support@zynkstore.ua',
    actionLabel: 'Написати листа',
  },
  {
    title: 'Соцмережі',
    value: 'Instagram · Telegram · Facebook',
    note: 'Слідкуй за новинками, акціями та новими надходженнями',
    action: '/about',
    actionLabel: 'Дізнатись більше',
  },
];

const showrooms = [
  {
    city: 'Київ',
    address: 'вул. Саксаганського, 112',
    hours: 'Працюємо з 8:00 до 21:00',
  },
  {
    city: 'Житомир',
    address: 'вул. Велика Бердичівська, 68',
    hours: 'Працюємо з 8:00 до 21:00',
  },
  {
    city: 'Дніпро',
    address: 'вул. Короленка, 18',
    hours: 'Працюємо з 8:00 до 21:00',
  },
];

const faq = [
  {
    question: 'Допоможете підібрати комплектуючі?',
    answer:
      'Так, ми допоможемо підібрати процесор, відеокарту, пам’ять, накопичувачі та інші компоненти під ваш бюджет і задачі.',
  },
  {
    question: 'Можна звернутися щодо сумісності?',
    answer:
      'Так, підкажемо, чи підійдуть обрані комплектуючі одне до одного та що краще взяти для стабільної збірки.',
  },
  {
    question: 'Чи консультуєте щодо готових ПК?',
    answer:
      'Так, допомагаємо не лише з окремими товарами, а й з підбором готових збірок для ігор, роботи чи навчання.',
  },
];

function Contacts() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>ZYNK STORE</span>
            <h1 className={styles.title}>Контакти</h1>
            <p className={styles.subtitle}>
              Маєш питання щодо комплектуючих, замовлення, гарантії або хочеш
              отримати консультацію по збірці ПК? Напиши або зателефонуй нам —
              ми завжди на зв’язку.
            </p>

            <div className={styles.heroActions}>
              <a href="tel:+380973334542" className={styles.primaryButton}>
                Зателефонувати
              </a>
              <a href="mailto:support@zynkstore.ua" className={styles.secondaryButton}>
                Написати на email
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroPanelLabel}>Швидкий зв’язок</div>
            <div className={styles.heroPanelMain}>Відповідаємо швидко</div>
            <p className={styles.heroPanelText}>
              Допоможемо з вибором комплектуючих, перевіримо сумісність,
              підкажемо по оплаті, доставці, гарантії та актуальних акціях.
            </p>
            <div className={styles.heroMeta}>
              <span>Консультація перед покупкою</span>
              <span>Підтримка після замовлення</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {contactCards.map((item) => (
            <article key={item.title} className={styles.contactCard}>
              <span className={styles.cardLabel}>{item.title}</span>
              <h3>{item.value}</h3>
              <p>{item.note}</p>
              <a href={item.action} className={styles.cardButton}>
                {item.actionLabel}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.showroomsSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>НАШІ ШОУРУМИ</span>
          <h2>Можеш завітати до нас офлайн</h2>
        </div>

        <div className={styles.showroomsGrid}>
          {showrooms.map((item) => (
            <article key={item.city} className={styles.showroomCard}>
              <span className={styles.showroomCity}>{item.city}</span>
              <h3>{item.address}</h3>
              <p>{item.hours}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoBox}>
          <div className={styles.infoContent}>
            <span className={styles.sectionKicker}>ЧИМ МОЖЕМО ДОПОМОГТИ</span>
            <h2>Підтримка на кожному етапі</h2>
            <p>
              Ми консультуємо не лише перед покупкою. Також допомагаємо з
              підбором сумісних комплектуючих, питаннями по замовленню, сервісу,
              гарантії та апгрейду вже після придбання.
            </p>
          </div>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>Підбір комплектуючих під бюджет</div>
            <div className={styles.infoItem}>Перевірка сумісності компонентів</div>
            <div className={styles.infoItem}>Консультація по готових збірках</div>
            <div className={styles.infoItem}>Питання доставки, оплати та гарантії</div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ЧАСТІ ПИТАННЯ</span>
          <h2>Що нас запитують найчастіше</h2>
        </div>

        <div className={styles.faqGrid}>
          {faq.map((item, index) => (
            <article key={item.question} className={styles.faqCard}>
              <div className={styles.faqIndex}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <span className={styles.sectionKicker}>ГОТОВІ ДОПОМОГТИ</span>
            <h2>Зв’яжися з нами зручним способом</h2>
            <p>
              Напиши, зателефонуй або завітай до шоуруму — ми допоможемо підібрати
              оптимальне рішення для твого ПК або робочого сетапу.
            </p>
          </div>

          <a href="tel:+380973334542" className={styles.primaryButton}>
            Зв’язатися зараз
          </a>
        </div>
      </section>
    </main>
  );
}

export default Contacts;
