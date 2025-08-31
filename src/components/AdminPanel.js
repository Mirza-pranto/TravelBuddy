import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faFileAlt,
    faTrash,
    faSpinner,
    faSearch,
    faEye,
    faUserShield,
    faTimes,
    faCheck,
    faFlag,
    faChartBar,
    faCheckCircle,
    faTimesCircle,
    faClock
} from '@fortawesome/free-solid-svg-icons';

const AdminPanel = ({ showAlert }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [reportsStats, setReportsStats] = useState({});
    const [reportStatusCounts, setReportStatusCounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState({
        users: 1,
        posts: 1,
        reports: 1
    });
    const [totalPages, setTotalPages] = useState({
        users: 1,
        posts: 1,
        reports: 1
    });

    const itemsPerPage = 10;

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'reports') {
            fetchReports();
            fetchReportsStats();
        }
    }, [activeTab, currentPage]);

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
                setTotalPages(prev => ({ ...prev, users: data.pagination.totalPages }));
            } else {
                showAlert(data.error || 'Failed to fetch users', 'error');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert('Error fetching users. Please check if the server is running.', 'error');
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setPosts(data.posts);
                setTotalPages(prev => ({ ...prev, posts: data.pagination.totalPages }));
            } else {
                showAlert(data.error || 'Failed to fetch posts', 'error');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            showAlert('Error fetching posts. Please check if the server is running.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5000/api/admin/reports?page=${currentPage.reports || 1}&limit=${itemsPerPage}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
                setReportStatusCounts(data.statusCounts || {});
                setTotalPages(prev => ({ ...prev, reports: data.pagination.totalPages }));
            } else {
                showAlert(data.error || 'Failed to fetch reports', 'error');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            showAlert('Error fetching reports. Please check if the server is running.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchReportsStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/reports-stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();

            if (data.success) {
                setReportsStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching report statistics:', error);
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
                fetchUsers();
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
                fetchPosts();
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
                fetchUsers();
            } else {
                showAlert(data.error || `Failed to ${action}`, 'error');
            }
        } catch (error) {
            console.error(`Error ${action}:`, error);
            showAlert(`Error ${action}`, 'error');
        }
    };

    const updateReportStatus = async (reportId, status, adminNotes = '') => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ status, adminNotes })
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                fetchReports(); // Refresh the reports list
                fetchReportsStats(); // Refresh statistics
            } else {
                showAlert(data.error || 'Failed to update report', 'error');
            }
        } catch (error) {
            console.error('Error updating report:', error);
            showAlert('Error updating report', 'error');
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'bg-warning', icon: faClock },
            reviewed: { class: 'bg-info', icon: faEye },
            resolved: { class: 'bg-success', icon: faCheckCircle },
            dismissed: { class: 'bg-secondary', icon: faTimesCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`badge ${config.class}`}>
                <FontAwesomeIcon icon={config.icon} className="me-1" />
                {status}
            </span>
        );
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
                                    >
                                        <FontAwesomeIcon icon={faFlag} className="me-2" />
                                        Reports
                                        {reportStatusCounts.pending > 0 && (
                                            <span className="badge bg-danger ms-2">
                                                {reportStatusCounts.pending}
                                            </span>
                                        )}
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

                            {/* Reports Tab */}
                            {activeTab === 'reports' && (
                                <div>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                                            <p>Loading reports...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Reports Statistics */}
                                            <div className="row mb-4">
                                                <div className="col-md-3 mb-3">
                                                    <div className="card bg-primary text-white text-center">
                                                        <div className="card-body">
                                                            <h5 className="card-title">{reportsStats.totalReports || 0}</h5>
                                                            <p className="card-text">Total Reports</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <div className="card bg-warning text-dark text-center">
                                                        <div className="card-body">
                                                            <h5 className="card-title">{reportStatusCounts.pending || 0}</h5>
                                                            <p className="card-text">Pending</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <div className="card bg-success text-white text-center">
                                                        <div className="card-body">
                                                            <h5 className="card-title">{reportStatusCounts.resolved || 0}</h5>
                                                            <p className="card-text">Resolved</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <div className="card bg-info text-white text-center">
                                                        <div className="card-body">
                                                            <h5 className="card-title">{reportStatusCounts.reviewed || 0}</h5>
                                                            <p className="card-text">Reviewed</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reports Table */}
                                            <div className="table-responsive">
                                                <table className="table table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Reported User</th>
                                                            <th>Reporter</th>
                                                            <th>Reason</th>
                                                            <th>Status</th>
                                                            <th>Date</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reports.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="6" className="text-center py-4">
                                                                    No reports found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            reports.map((report) => (
                                                                <tr key={report._id}>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img
                                                                                src={getProfilePicUrl(report.reportedUser.profilePic)}
                                                                                alt={report.reportedUser.name}
                                                                                className="rounded-circle me-2"
                                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = "https://via.placeholder.com/40?text=User";
                                                                                }}
                                                                            />
                                                                            <div>
                                                                                <div className="fw-bold">{report.reportedUser.name}</div>
                                                                                <small className="text-muted">{report.reportedUser.email}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <img
                                                                                src={getProfilePicUrl(report.reporter.profilePic)}
                                                                                alt={report.reporter.name}
                                                                                className="rounded-circle me-2"
                                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = "https://via.placeholder.com/40?text=User";
                                                                                }}
                                                                            />
                                                                            <div>
                                                                                <div className="fw-bold">{report.reporter.name}</div>
                                                                                <small className="text-muted">{report.reporter.email}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-secondary">{report.reason}</span>
                                                                        {report.description && (
                                                                            <div className="mt-1">
                                                                                <small className="text-muted" title={report.description}>
                                                                                    {report.description.length > 50 
                                                                                        ? `${report.description.substring(0, 50)}...` 
                                                                                        : report.description
                                                                                    }
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {getStatusBadge(report.status)}
                                                                    </td>
                                                                    <td>
                                                                        <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                onClick={() => {
                                                                                    alert(`Report Details:\n\nReason: ${report.reason}\nDescription: ${report.description || 'None'}\nStatus: ${report.status}`);
                                                                                }}
                                                                                title="View Details"
                                                                            >
                                                                                <FontAwesomeIcon icon={faEye} />
                                                                            </button>
                                                                            {report.status === 'pending' && (
                                                                                <>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-success"
                                                                                        onClick={() => updateReportStatus(report._id, 'resolved', 'Report resolved by admin')}
                                                                                        title="Resolve Report"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                                                    </button>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-danger"
                                                                                        onClick={() => updateReportStatus(report._id, 'dismissed', 'Report dismissed by admin')}
                                                                                        title="Dismiss Report"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTimesCircle} />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {renderPagination('reports')}
                                        </div>
                                    )}
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