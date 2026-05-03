import styles from '../../styles/Delivery.module.css';

const deliveryOptions = [
  {
    title: 'Доставка по Україні',
    text: 'Надсилаємо замовлення по всій Україні через популярні служби доставки. Після оформлення замовлення ми уточнюємо всі деталі та швидко передаємо товар у відправку.',
  },
  {
    title: 'Самовивіз із шоуруму',
    text: 'Якщо тобі зручніше забрати товар особисто, можна оформити самовивіз у одному з наших шоурумів після підтвердження наявності.',
  },
  {
    title: 'Швидка обробка замовлень',
    text: 'Ми стараємося обробляти заявки максимально оперативно, щоб ти отримав потрібні комплектуючі або периферію без зайвого очікування.',
  },
];

const paymentOptions = [
  'Оплата онлайн банківською карткою',
  'Безготівковий розрахунок для фізичних та юридичних осіб',
  'Оплата за реквізитами після підтвердження замовлення',
  'Уточнення доступного способу оплати під час оформлення',
];

const steps = [
  'Оформлюєш замовлення на сайті або через менеджера.',
  'Ми зв’язуємося з тобою для підтвердження наявності та деталей.',
  'Погоджуємо доставку, оплату та, за потреби, консультацію по товару.',
  'Після відправлення ти отримуєш дані для відстеження замовлення.',
];

const notes = [
  'Вартість доставки залежить від тарифів перевізника та параметрів відправлення.',
  'Терміни доставки можуть змінюватися залежно від міста, завантаження служби доставки та наявності товару.',
  'Перед оплатою рекомендуємо уточнити сумісність комплектуючих, якщо замовляєш апгрейд або збірку.',
  'У разі питань щодо доставки чи оплати наша команда завжди допоможе.',
];

function DeliveryPayment() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>ZYNK STORE</span>
            <h1 className={styles.title}>Доставка та оплата</h1>
            <p className={styles.subtitle}>
              Ми зробили процес замовлення максимально зрозумілим: від
              підтвердження товару до доставки та вибору зручного способу
              оплати. Швидко, прозоро та без зайвих труднощів.
            </p>

            <div className={styles.heroActions}>
              <a href="/contacts" className={styles.primaryButton}>
                Уточнити деталі
              </a>
              <a href="/catalog" className={styles.secondaryButton}>
                Перейти до каталогу
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.heroPanelLabel}>Коротко про головне</div>
            <div className={styles.heroPanelMain}>Швидко та зручно</div>
            <p className={styles.heroPanelText}>
              Підкажемо по способах доставки, допоможемо вибрати варіант оплати
              та супроводимо замовлення до моменту отримання.
            </p>
            <div className={styles.heroMeta}>
              <span>Доставка по Україні</span>
              <span>Кілька способів оплати</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.deliverySection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ДОСТАВКА</span>
          <h2>Як ми доставляємо замовлення</h2>
        </div>

        <div className={styles.deliveryGrid}>
          {deliveryOptions.map((item, index) => (
            <article key={item.title} className={styles.infoCard}>
              <div className={styles.cardNumber}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.paymentSection}>
        <div className={styles.paymentGrid}>
          <article className={styles.darkCard}>
            <span className={styles.darkCardLabel}>СПОСОБИ ОПЛАТИ</span>
            <h2>Обирай варіант, який тобі підходить</h2>
            <ul className={styles.darkList}>
              {paymentOptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.lightCard}>
            <span className={styles.sectionKicker}>ЯК ВІДБУВАЄТЬСЯ ЗАМОВЛЕННЯ</span>
            <h2>Від заявки до отримання</h2>
            <div className={styles.stepsList}>
              {steps.map((item, index) => (
                <div key={item} className={styles.stepItem}>
                  <div className={styles.stepIndex}>{index + 1}</div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className={styles.notesSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionKicker}>ВАЖЛИВО ЗНАТИ</span>
          <h2>Додаткова інформація</h2>
        </div>

        <div className={styles.notesGrid}>
          {notes.map((item) => (
            <div key={item} className={styles.noteCard}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <span className={styles.sectionKicker}>ПОТРІБНА ДОПОМОГА</span>
            <h2>Є питання щодо доставки або оплати?</h2>
            <p>
              Напиши нам, і ми підкажемо найзручніший спосіб оформлення
              замовлення, доставки та оплати саме для твоєї ситуації.
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

export default DeliveryPayment;
