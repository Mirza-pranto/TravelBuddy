// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faFileAlt,
    faTrash,
    faChartBar,
    faSpinner,
    faSearch,
    faEye,
    faUserShield,
    faTimes,
    faCheck
} from '@fortawesome/free-solid-svg-icons';

const AdminPanel = ({ showAlert }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState({
        users: 1,
        posts: 1
    });
    const [totalPages, setTotalPages] = useState({
        users: 1,
        posts: 1
    });

    const itemsPerPage = 10;

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        }
    }, [activeTab, currentPage]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            } else {
                showAlert('Failed to fetch dashboard stats', 'error');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            showAlert('Error fetching dashboard stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/admin/users?page=${currentPage.users}&limit=${itemsPerPage}&search=${searchTerm}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
                setTotalPages(prev => ({ ...prev, users: data.pagination.totalPages }));
            } else {
                showAlert('Failed to fetch users', 'error');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert('Error fetching users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/admin/posts?page=${currentPage.posts}&limit=${itemsPerPage}&search=${searchTerm}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
                setTotalPages(prev => ({ ...prev, posts: data.pagination.totalPages }));
            } else {
                showAlert('Failed to fetch posts', 'error');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            showAlert('Error fetching posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                fetchUsers(); // Refresh the user list
                if (activeTab === 'dashboard') {
                    fetchDashboardStats(); // Refresh stats
                }
            } else {
                showAlert(data.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('Error deleting user', 'error');
        }
    };

    const deletePost = async (postId, postTitle) => {
        if (!window.confirm(`Are you sure you want to delete post "${postTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                fetchPosts(); // Refresh the post list
                if (activeTab === 'dashboard') {
                    fetchDashboardStats(); // Refresh stats
                }
            } else {
                showAlert(data.error || 'Failed to delete post', 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showAlert('Error deleting post', 'error');
        }
    };

    const toggleAdminStatus = async (userId, userName, currentStatus) => {
        const action = currentStatus ? 'remove from admin' : 'promote to admin';
        if (!window.confirm(`Are you sure you want to ${action} "${userName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-admin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                fetchUsers(); // Refresh the user list
            } else {
                showAlert(data.error || `Failed to ${action}`, 'error');
            }
        } catch (error) {
            console.error(`Error ${action}:`, error);
            showAlert(`Error ${action}`, 'error');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (activeTab === 'users') {
            setCurrentPage({ ...currentPage, users: 1 });
            fetchUsers();
        } else if (activeTab === 'posts') {
            setCurrentPage({ ...currentPage, posts: 1 });
            fetchPosts();
        }
    };

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/50?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `http://localhost:5000${profilePic}`;
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/100?text=No+Image";
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    const renderPagination = (type) => {
        const total = totalPages[type];
        const current = currentPage[type];

        if (total <= 1) return null;

        return (
            <nav aria-label={`${type} pagination`}>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage({ ...currentPage, [type]: current - 1 })}
                        >
                            Previous
                        </button>
                    </li>

                    {[...Array(total)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${current === i + 1 ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage({ ...currentPage, [type]: i + 1 })}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${current === total ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage({ ...currentPage, [type]: current + 1 })}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <FontAwesomeIcon icon={faUserShield} className="me-2" />
                                Admin Panel
                            </h4>
                        </div>

                        <div className="card-body">
                            {/* Navigation Tabs */}
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('dashboard')}
                                    >
                                        <FontAwesomeIcon icon={faChartBar} className="me-2" />
                                        Dashboard
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('users')}
                                    >
                                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                                        Users
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('posts')}
                                    >
                                        <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                        Posts
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('reports')}
                                        disabled
                                    >
                                        <FontAwesomeIcon icon={faEye} className="me-2" />
                                        Reports (Coming Soon)
                                    </button>
                                </li>
                            </ul>

                            {/* Search Bar for Users and Posts */}
                            {(activeTab === 'users' || activeTab === 'posts') && (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <form onSubmit={handleSearch}>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={`Search ${activeTab}...`}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button className="btn btn-outline-primary" type="submit">
                                                    <FontAwesomeIcon icon={faSearch} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Dashboard Tab */}
                            {activeTab === 'dashboard' && (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                                            <p>Loading dashboard statistics...</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {/* Stats Cards */}
                                            <div className="col-md-3 mb-4">
                                                <div className="card bg-primary text-white text-center">
                                                    <div className="card-body">
                                                        <h2 className="card-title">{stats.totalUsers || 0}</h2>
                                                        <p className="card-text">Total Users</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-4">
                                                <div className="card bg-success text-white text-center">
                                                    <div className="card-body">
                                                        <h2 className="card-title">{stats.totalPosts || 0}</h2>
                                                        <p className="card-text">Total Posts</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-4">
                                                <div className="card bg-info text-white text-center">
                                                    <div className="card-body">
                                                        <h2 className="card-title">{stats.totalAdmins || 0}</h2>
                                                        <p className="card-text">Admins</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 mb-4">
                                                <div className="card bg-warning text-white text-center">
                                                    <div className="card-body">
                                                        <h2 className="card-title">{stats.recentUsers || 0}</h2>
                                                        <p className="card-text">New Users (7 days)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Travel Type Distribution */}
                                            {stats.postsByTravelType && stats.postsByTravelType.length > 0 && (
                                                <div className="col-12 mb-4">
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h5 className="mb-0">Posts by Travel Type</h5>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="row">
                                                                {stats.postsByTravelType.map((type) => (
                                                                    <div key={type._id} className="col-md-3 mb-2">
                                                                        <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                                                                            <span className="text-capitalize">{type._id || 'Other'}</span>
                                                                            <span className="badge bg-primary">{type.count}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Quick Actions */}
                                            <div className="col-12">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="mb-0">Quick Actions</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="row">
                                                            <div className="col-md-4 mb-2">
                                                                <button
                                                                    className="btn btn-outline-primary w-100"
                                                                    onClick={() => setActiveTab('users')}
                                                                >
                                                                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                                                                    Manage Users
                                                                </button>
                                                            </div>
                                                            <div className="col-md-4 mb-2">
                                                                <button
                                                                    className="btn btn-outline-success w-100"
                                                                    onClick={() => setActiveTab('posts')}
                                                                >
                                                                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                                                    Manage Posts
                                                                </button>
                                                            </div>
                                                            <div className="col-md-4 mb-2">
                                                                <button
                                                                    className="btn btn-outline-info w-100"
                                                                    onClick={() => setActiveTab('reports')}
                                                                    disabled
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="me-2" />
                                                                    View Reports
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                                            <p>Loading users...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="table-responsive">
                                                <table className="table table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>User</th>
                                                            <th>Email</th>
                                                            <th>Posts</th>
                                                            <th>Status</th>
                                                            <th>Joined</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {users.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="6" className="text-center py-4">
                                                                    No users found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            users.map((user) => (
                                                                <tr key={user._id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img
                                                                                src={getProfilePicUrl(user.profilePic)}
                                                                                alt={user.name}
                                                                                className="rounded-circle me-2"
                                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = "https://via.placeholder.com/40?text=User";
                                                                                }}
                                                                            />
                                                                            <div>
                                                                                <div className="fw-bold">{user.name}</div>
                                                                                <small className="text-muted">ID: {user._id}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>{user.email}</td>
                                                                    <td>
                                                                        <span className="badge bg-info">{user.postsCount || 0}</span>
                                                                    </td>
                                                                    <td>
                                                                        {user.isAdmin ? (
                                                                            <span className="badge bg-warning">Admin</span>
                                                                        ) : (
                                                                            <span className="badge bg-success">User</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <small>{new Date(user.date).toLocaleDateString()}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn btn-sm btn-outline-warning"
                                                                                onClick={() => toggleAdminStatus(user._id, user.name, user.isAdmin)}
                                                                                title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                                                                            >
                                                                                <FontAwesomeIcon icon={user.isAdmin ? faTimes : faCheck} />
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => deleteUser(user._id, user.name)}
                                                                                title="Delete User"
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {renderPagination('users')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Posts Tab */}
                            {activeTab === 'posts' && (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                                            <p>Loading posts...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="table-responsive">
                                                <table className="table table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Post</th>
                                                            <th>Author</th>
                                                            <th>Destination</th>
                                                            <th>Travel Type</th>
                                                            <th>Budget</th>
                                                            <th>Created</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {posts.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="7" className="text-center py-4">
                                                                    No posts found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            posts.map((post) => (
                                                                <tr key={post._id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            {post.featuredImage && (
                                                                                <img
                                                                                    src={getImageUrl(post.featuredImage)}
                                                                                    alt={post.title}
                                                                                    className="me-2"
                                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = "https://via.placeholder.com/50?text=No+Image";
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            <div>
                                                                                <div className="fw-bold">{post.title}</div>
                                                                                <small className="text-muted">ID: {post._id}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img
                                                                                src={getProfilePicUrl(post.user.profilePic)}
                                                                                alt={post.user.name}
                                                                                className="rounded-circle me-2"
                                                                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = "https://via.placeholder.com/30?text=User";
                                                                                }}
                                                                            />
                                                                            <div>
                                                                                <div>{post.user.name}</div>
                                                                                <small className="text-muted">{post.user.email}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>{post.destination}</td>
                                                                    <td>
                                                                        <span className="badge bg-secondary text-capitalize">
                                                                            {post.travelType}
                                                                        </span>
                                                                    </td>
                                                                    <td>${post.budget}</td>
                                                                    <td>
                                                                        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => deletePost(post._id, post.title)}
                                                                            title="Delete Post"
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {renderPagination('posts')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reports Tab (Placeholder) */}
                            {activeTab === 'reports' && (
                                <div className="text-center py-5">
                                    <FontAwesomeIcon icon={faEye} size="3x" className="text-muted mb-3" />
                                    <h4>Reports Feature Coming Soon</h4>
                                    <p className="text-muted">
                                        This section will display all user reports and moderation tools.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;