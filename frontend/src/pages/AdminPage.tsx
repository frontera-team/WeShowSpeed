import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, getAllUsers } from '../auth';
import {
  getAchievements,
  addAchievement,
  removeAchievement,
  getUserAchievements,
  grantAchievement,
  revokeAchievement,
  type Achievement,
} from '../achievements';
import { useLocale } from '../i18n';

export function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [users, setUsers] = useState<ReturnType<typeof getAllUsers>>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🏆');
  const [grantUserId, setGrantUserId] = useState('');
  const [grantAchId, setGrantAchId] = useState('');
  const [error, setError] = useState('');
  const { t } = useLocale();

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (!u || u.role !== 'staff') {
      navigate('/', { replace: true });
      return;
    }
    setAchievements(getAchievements());
    setUsers(getAllUsers());
  }, [navigate]);

  const refresh = () => {
    setAchievements(getAchievements());
    setUsers(getAllUsers());
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = newName.trim();
    if (!name) {
      setError(t('admin.nameRequired'));
      return;
    }
    addAchievement({ name, description: newDesc.trim(), icon: newIcon.trim() || '🏆' });
    setNewName('');
    setNewDesc('');
    setNewIcon('🏆');
    refresh();
  };

  const handleRemove = (id: string) => {
    if (window.confirm(t('admin.deleteConfirm'))) {
      removeAchievement(id);
      refresh();
    }
  };

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId || !grantAchId) return;
    grantAchievement(grantUserId, grantAchId);
    setGrantUserId('');
    setGrantAchId('');
    refresh();
  };

  const handleRevoke = (userId: string, achId: string) => {
    revokeAchievement(userId, achId);
    refresh();
  };

  if (!user || user.role !== 'staff') return null;

  return (
    <section className="admin">
      <div className="admin__header">
        <Link to="/" className="admin__back">
          {t('admin.back')}
        </Link>
        <h2 className="admin__title">{t('admin.title')}</h2>
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">{t('admin.achievements')}</h3>
        <form className="admin__form" onSubmit={handleAddAchievement}>
          <label className="admin__label">
            {t('admin.name')}
            <input
              type="text"
              className="admin__input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('admin.placeholderName')}
              maxLength={80}
            />
          </label>
          <label className="admin__label">
            {t('admin.description')}
            <input
              type="text"
              className="admin__input"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={t('admin.placeholderDesc')}
              maxLength={300}
            />
          </label>
          <label className="admin__label">
            {t('admin.icon')}
            <input
              type="text"
              className="admin__input admin__input--icon"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder={t('admin.placeholderIcon')}
              maxLength={10}
            />
          </label>
          {error && <p className="admin__error">{error}</p>}
          <button type="submit" className="admin__btn">
            {t('admin.addAchievement')}
          </button>
        </form>

        <ul className="admin__list">
          {achievements.map((a) => (
            <li key={a.id} className="admin__item">
              <span className="admin__item-icon">{a.icon}</span>
              <div className="admin__item-body">
                <strong className="admin__item-name">{a.name}</strong>
                {a.description && <span className="admin__item-desc">{a.description}</span>}
              </div>
              <button
                type="button"
                className="admin__btn admin__btn--small admin__btn--danger"
                onClick={() => handleRemove(a.id)}
              >
                {t('admin.delete')}
              </button>
            </li>
          ))}
        </ul>
        {achievements.length === 0 && (
          <p className="admin__empty">{t('admin.noAchievements')}</p>
        )}
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">{t('admin.grantTitle')}</h3>
        <form className="admin__form admin__form--row" onSubmit={handleGrant}>
          <label className="admin__label">
            {t('admin.user')}
            <select
              className="admin__input"
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              required
            >
              <option value="">{t('admin.selectUser')}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label className="admin__label">
            {t('admin.achievement')}
            <select
              className="admin__input"
              value={grantAchId}
              onChange={(e) => setGrantAchId(e.target.value)}
              required
            >
              <option value="">{t('admin.selectAchievement')}</option>
              {achievements.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="admin__btn" disabled={!grantUserId || !grantAchId}>
            {t('admin.grant')}
          </button>
        </form>
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">{t('admin.usersTitle')}</h3>
        <ul className="admin__user-list">
          {users.map((u) => {
            const userAchs = getUserAchievements(u.id);
            const resolved = userAchs
              .map((id) => achievements.find((a) => a.id === id))
              .filter(Boolean) as Achievement[];
            return (
              <li key={u.id} className="admin__user-item">
                <div className="admin__user-info">
                  <strong>{u.name}</strong> ({u.email}) {u.role === 'staff' && <span className="admin__badge">staff</span>}
                </div>
                <div className="admin__user-achs">
                  {resolved.length === 0 ? (
                    <span className="admin__muted">{t('admin.none')}</span>
                  ) : (
                    resolved.map((a) => (
                      <span key={a.id} className="admin__ach-tag">
                        {a.icon} {a.name}
                        <button
                          type="button"
                          className="admin__revoke"
                          onClick={() => handleRevoke(u.id, a.id)}
                          title={t('admin.revoke')}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
