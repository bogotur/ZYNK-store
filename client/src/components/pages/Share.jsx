import styles from '../../styles/Share.module.css';

const promoCards = [
  {
    badge: '-50%',
    title: 'Знижки на периферію',
    text: 'Клавіатури, мишки, гарнітури та аксесуари зі знижками для комфортного геймінгу та роботи.',
  },
  {
    badge: 'ТОП',
    title: 'Готові збірки ПК',
    text: 'Спеціальні ціни на готові системні блоки для ігор, стримінгу, монтажу та повсякденних задач.',
  },
  {
    badge: 'NEW',
    title: 'Апгрейд-комплекти',
    text: 'Вигідні пропозиції на процесори, материнські плати, RAM і SSD для швидкого оновлення системи.',
  },
];

const hotOffers = [
  {
    category: 'Відеокарти',
    title: 'RTX / RX серії за акційними цінами',
    oldPrice: 'від 24 999₴',
    newPrice: 'від 19 499₴',
  },
  {
    category: 'Процесори',
    title: 'AMD Ryzen та Intel Core',
    oldPrice: 'від 8 999₴',
    newPrice: 'від 6 999₴',
  },
  {
    category: 'SSD накопичувачі',
    title: 'NVMe для швидкого апгрейду',
    oldPrice: 'від 3 499₴',
    newPrice: 'від 2 499₴',
  },
  {
    category: 'Периферія',
    title: 'Клавіатури, мишки, гарнітури',
    oldPrice: 'від 2 199₴',
    newPrice: 'від 1 499₴',
  },
];

const reasons = [
  'Чесні знижки без “намальованих” цін',
  'Актуальні комплектуючі та популярні бренди',
  'Підбір акційних товарів під ваш бюджет',
  'Консультація перед покупкою та після неї',
];

function Sales() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>ZYNK STORE</span>
            <h1 className={styles.title}>Акції</h1>
            <p className={styles.subtitle}>
              Вигідні пропозиції на комп’ютерні комплектуючі, периферію та готові
              збірки. Оновлюй свій сетап розумно та без переплат.
            </p>

            <div className={styles.heroActions}>
              <a href="/catalog" className={styles.primaryButton}>
                Дивитися товари
              </a>
              <a href="/contacts" className={styles.secondaryButton}>
                Запитати менеджера
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroPanelLabel}>Спецпропозиція тижня</div>
            <div className={styles.heroDiscount}>до -50%</div>
            <p className={styles.heroPanelText}>
              На популярну периферію, комплектуючі для апгрейду та окремі готові
              конфігурації ПК.
            </p>
            <div className={styles.heroMeta}>
              <span>Оновлення акцій регулярно</span>
              <span>Кількість товарів обмежена</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.promoSection}>
        <div className={styles.promoGrid}>
          {promoCards.map((item) => (
            <article key={item.title} className={styles.promoCard}>
              <span className={styles.promoBadge}>{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.offersSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ГАРЯЧІ ПРОПОЗИЦІЇ</span>
          <h2>Що зараз вигідно купувати</h2>
        </div>

        <div className={styles.offersGrid}>
          {hotOffers.map((item) => (
            <article key={item.title} className={styles.offerCard}>
              <span className={styles.offerCategory}>{item.category}</span>
              <h3>{item.title}</h3>
              <div className={styles.priceRow}>
                <span className={styles.oldPrice}>{item.oldPrice}</span>
                <span className={styles.newPrice}>{item.newPrice}</span>
              </div>
              <a href="/catalog" className={styles.cardButton}>
                Перейти в каталог
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoBox}>
          <div className={styles.infoContent}>
            <span className={styles.sectionKicker}>ЧОМУ ЦЕ ВИГІДНО</span>
            <h2>Акції без зайвого шуму</h2>
            <p>
              Ми зібрали пропозиції, які реально допомагають купити потрібні
              комплектуючі дешевше. Без складних умов — тільки зрозумілі знижки
              та актуальні товари.
            </p>
          </div>

          <ul className={styles.reasonList}>
            {reasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <span className={styles.sectionKicker}>ПОТРІБНА ДОПОМОГА</span>
            <h2>Підберемо акційний товар під твій бюджет</h2>
            <p>
              Напиши нам, що саме шукаєш, і ми допоможемо знайти найкращу
              пропозицію серед комплектуючих, периферії або готових збірок.
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

export default Sales;
