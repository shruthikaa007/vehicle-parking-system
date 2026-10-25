import React, { useState, useEffect } from 'react';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    registration_id: '',
    department: '',
    role: 'student'
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Get the currently logged-in user from browser storage
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          registration_id: user.registration_id || '',
          department: user.department || '',
          role: user.role || 'student'
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Update stored user information
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const updatedUser = {
          ...user,
          name: profile.name,
          phone: profile.phone,
          department: profile.department
        };

        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Failed to update stored user:', error);
      }
    }

    alert('Profile updated successfully!');
    setEditing(false);
  };

  return (
    <div className="p-4">

      <h2 className="mb-4">
        👤 User Profile
      </h2>

      <div className="row">

        {/* ================= PROFILE INFORMATION ================= */}
        <div className="col-md-8">

          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0">
                Profile Information
              </h5>

              <button
                className="btn btn-sm btn-primary"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>

            </div>

            <div className="card-body">

              {editing ? (

                <form onSubmit={handleSave}>

                  {/* Name */}
                  <div className="mb-3">

                    <label className="form-label">
                      Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      required
                    />

                  </div>

                  {/* Email */}
                  <div className="mb-3">

                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={profile.email}
                      disabled
                    />

                  </div>

                  {/* Phone */}
                  <div className="mb-3">

                    <label className="form-label">
                      Phone
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                    />

                  </div>

                  {/* Registration ID */}
                  <div className="mb-3">

                    <label className="form-label">
                      Registration ID
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="registration_id"
                      value={profile.registration_id}
                      disabled
                    />

                  </div>

                  {/* Department */}
                  <div className="mb-3">

                    <label className="form-label">
                      Department
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={profile.department}
                      onChange={handleInputChange}
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>

                </form>

              ) : (

                <div>

                  <p>
                    <strong>Name:</strong>{' '}
                    {profile.name || 'Not available'}
                  </p>

                  <p>
                    <strong>Email:</strong>{' '}
                    {profile.email || 'Not available'}
                  </p>

                  <p>
                    <strong>Phone:</strong>{' '}
                    {profile.phone || 'Not available'}
                  </p>

                  <p>
                    <strong>Registration ID:</strong>{' '}
                    {profile.registration_id || 'Not available'}
                  </p>

                  <p>
                    <strong>Department:</strong>{' '}
                    {profile.department || 'Not available'}
                  </p>

                  <p>
                    <strong>Role:</strong>{' '}

                    <span className="badge bg-primary">
                      {profile.role}
                    </span>

                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* ================= ACCOUNT SETTINGS ================= */}
        <div className="col-md-4">

          <div className="card">

            <div className="card-header">
              <h5>Account Settings</h5>
            </div>

            <div className="card-body">

              <div className="d-grid gap-2">

                <button
                  className="btn btn-outline-primary"
                  type="button"
                >
                  Change Password
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                >
                  Change Email
                </button>

                <button
                  className="btn btn-outline-danger"
                  type="button"
                >
                  Logout
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;