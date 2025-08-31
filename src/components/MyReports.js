import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFlag,
    faSpinner,
    faEye,
    faClock,
    faCheckCircle,
    faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const MyReports = ({ showAlert }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchMyReports();
    }, [currentPage]);

    const fetchMyReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/reports/my-reports?page=${currentPage}&limit=${itemsPerPage}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
                setTotalPages(data.pagination.totalPages);
            } else {
                showAlert(data.error || 'Failed to fetch your reports', 'error');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            showAlert('Error fetching your reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/50?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `http://localhost:5000${profilePic}`;
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

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <nav aria-label="Reports pagination">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                <h4>Loading your reports...</h4>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                        <FontAwesomeIcon icon={faFlag} className="me-2" />
                        My Reports
                    </h4>
                </div>
                <div className="card-body">
                    {reports.length === 0 ? (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faFlag} size="3x" className="text-muted mb-3" />
                            <h5>No Reports Yet</h5>
                            <p className="text-muted">
                                You haven't reported any users yet. Reports will appear here once you submit them.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Reported User</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
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
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        alert(`Report Details:\n\nReason: ${report.reason}\nDescription: ${report.description || 'None'}\nStatus: ${report.status}\nSubmitted: ${new Date(report.createdAt).toLocaleString()}`);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
};

export default MyReports;