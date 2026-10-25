import React, { useState } from 'react';

function EntryExitManagement() {
  const [tab, setTab] = useState('entry');
  const [regNumber, setRegNumber] = useState('');
  const [gate, setGate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${tab === 'entry' ? 'Entry' : 'Exit'} recorded for ${regNumber}`);
    setRegNumber('');
    setGate('');
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">📍 Entry/Exit Management</h2>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${tab === 'entry' ? 'active' : ''}`}
                onClick={() => setTab('entry')}
              >
                📥 Record Entry
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${tab === 'exit' ? 'active' : ''}`}
                onClick={() => setTab('exit')}
              >
                📤 Record Exit
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                className="form-control"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="TN07AB1234"
                required
              />
            </div>
            {tab === 'entry' && (
              <div className="mb-3">
                <label className="form-label">Gate</label>
                <select 
                  className="form-select"
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  required
                >
                  <option value="">Select Gate</option>
                  <option value="North">North Gate</option>
                  <option value="South">South Gate</option>
                  <option value="East">East Gate</option>
                  <option value="West">West Gate</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              {tab === 'entry' ? 'Record Entry' : 'Record Exit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EntryExitManagement;
