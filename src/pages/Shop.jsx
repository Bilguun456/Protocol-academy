import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { SECTIONS } from '../data/shop';
import styles from './Shop.module.css';

export default function Shop() {
  const { user, inventory, purchaseItem } = useApp();
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash]   = useState(null);

  useEffect(() => {
    api.getShopItems().then(res => setItems(res.items)).catch(() => {});
  }, []);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  async function buyItem(item) {
    const result = await purchaseItem(item);
    setFlash({ id: item.id, msg: result.error ? result.error : 'Purchased!' });
    setTimeout(() => setFlash(null), 1800);
  }

  const owned = id => inventory.includes(id);

  return (
    <div className="page-container">
      <div className={styles.topBar}>
        <h1 className={styles.title}>Shop</h1>
        <div className={styles.topRight}>
          <span className={styles.balance}>⬡ {user?.coins ?? 0} coins</span>
          <input
            type="search"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      <p className={styles.subtitle}>Cosmetic items only — never affects gameplay.</p>

      {search ? (
        <div>
          <div className="section-title" style={{ marginTop: 20 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </div>
          <div className={styles.grid}>
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} onBuy={() => buyItem(item)}
                owned={owned(item.id)} flash={flash?.id === item.id ? flash.msg : null} />
            ))}
          </div>
        </div>
      ) : (
        SECTIONS.map(section => {
          const sectionItems = items.filter(i => i.section === section.key);
          return (
            <div key={section.key} className={styles.section}>
              <div className="section-title">{section.label}</div>
              <div className={styles.grid}>
                {sectionItems.map(item => (
                  <ItemCard key={item.id} item={item} onBuy={() => buyItem(item)}
                    owned={owned(item.id)} flash={flash?.id === item.id ? flash.msg : null} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ItemCard({ item, onBuy, owned, flash }) {
  const price  = item.salePrice ?? item.price;
  const onSale = item.salePrice != null;
  return (
    <div className={styles.card}>
      <div className={styles.preview}>{item.preview}</div>
      <div className={styles.cardBody}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemDesc}>{item.description}</div>
        <div className={styles.itemMeta}>
          <span className={`tag ${onSale ? 'tag-medium' : ''}`}
            style={!onSale ? { color: 'var(--text-muted)', background: 'transparent', padding: 0 } : {}}>
            {item.category}
          </span>
          <div className={styles.priceRow}>
            {onSale && <span className={styles.origPrice}>{item.price}</span>}
            <span className={styles.price} style={onSale ? { color: 'var(--orange)' } : {}}>
              ⬡ {price}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.buyWrap}>
        {flash ? (
          <span className={styles.flashMsg}
            style={{ color: flash === 'Purchased!' ? 'var(--accent)' : 'var(--red)' }}>
            {flash}
          </span>
        ) : owned ? (
          <span className={styles.owned}>Owned</span>
        ) : (
          <button className="btn btn-accent" style={{ fontSize: 12, padding: '5px 12px' }} onClick={onBuy}>
            Buy
          </button>
        )}
      </div>
    </div>
  );
}
