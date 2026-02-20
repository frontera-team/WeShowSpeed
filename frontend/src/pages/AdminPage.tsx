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
      setError('Name is required');
      return;
    }
    addAchievement({ name, description: newDesc.trim(), icon: newIcon.trim() || '🏆' });
    setNewName('');
    setNewDesc('');
    setNewIcon('🏆');
    refresh();
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Delete this achievement? Users will lose it.')) {
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
          ← Back
        </Link>
        <h2 className="admin__title">Admin panel</h2>
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">Achievements</h3>
        <form className="admin__form" onSubmit={handleAddAchievement}>
          <label className="admin__label">
            Name
            <input
              type="text"
              className="admin__input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Achievement name"
              maxLength={80}
            />
          </label>
          <label className="admin__label">
            Description
            <input
              type="text"
              className="admin__input"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description"
              maxLength={300}
            />
          </label>
          <label className="admin__label">
            Icon (emoji)
            <input
              type="text"
              className="admin__input admin__input--icon"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="🏆"
              maxLength={10}
            />
          </label>
          {error && <p className="admin__error">{error}</p>}
          <button type="submit" className="admin__btn">
            Add achievement
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
                Delete
              </button>
            </li>
          ))}
        </ul>
        {achievements.length === 0 && (
          <p className="admin__empty">No achievements yet. Add one above.</p>
        )}
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">Grant achievement to user</h3>
        <form className="admin__form admin__form--row" onSubmit={handleGrant}>
          <label className="admin__label">
            User
            <select
              className="admin__input"
              value={grantUserId}
              onChange={(e) => setGrantUserId(e.target.value)}
              required
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label className="admin__label">
            Achievement
            <select
              className="admin__input"
              value={grantAchId}
              onChange={(e) => setGrantAchId(e.target.value)}
              required
            >
              <option value="">Select achievement</option>
              {achievements.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="admin__btn" disabled={!grantUserId || !grantAchId}>
            Grant
          </button>
        </form>
      </div>

      <div className="admin__section">
        <h3 className="admin__section-title">Users & their achievements</h3>
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
                    <span className="admin__muted">None</span>
                  ) : (
                    resolved.map((a) => (
                      <span key={a.id} className="admin__ach-tag">
                        {a.icon} {a.name}
                        <button
                          type="button"
                          className="admin__revoke"
                          onClick={() => handleRevoke(u.id, a.id)}
                          title="Revoke"
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
