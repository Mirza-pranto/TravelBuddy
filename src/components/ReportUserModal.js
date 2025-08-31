import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ReportUserModal = ({ show, onHide, reportedUser, showAlert }) => {
    const [reason, setReason] = useState('Other');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reports/report-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    reportedUserId: reportedUser._id,
                    reason,
                    description
                })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('User reported successfully. Our team will review your report.', 'success');
                onHide();
                // Reset form
                setReason('Other');
                setDescription('');
            } else {
                showAlert(data.error || 'Failed to report user', 'error');
            }
        } catch (error) {
            console.error('Error reporting user:', error);
            showAlert('Error reporting user. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faFlag} className="me-2 text-danger" />
                    Report User
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Alert variant="warning" className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        <div>
                            <strong>Reporting: {reportedUser?.name}</strong>
                            <div className="small">Please provide details about why you're reporting this user.</div>
                        </div>
                    </Alert>

                    <Form.Group className="mb-3">
                        <Form.Label>Reason for reporting</Form.Label>
                        <Form.Select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="Spam">Spam</option>
                            <option value="Harassment">Harassment</option>
                            <option value="Inappropriate Content">Inappropriate Content</option>
                            <option value="Fake Profile">Fake Profile</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Additional details (optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide any additional information that might help us review this report..."
                            maxLength={500}
                        />
                        <Form.Text className="text-muted">
                            {description.length}/500 characters
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReportUserModal;