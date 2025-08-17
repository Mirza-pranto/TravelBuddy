import React from 'react';
import Notes from './Notes';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenAlt, faStickyNote } from '@fortawesome/free-solid-svg-icons';

const CreatePost = (props) => {
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg">
            <Card.Header className="bg-success text-white">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faPenAlt} className="me-2" size="lg" />
                <h4 className="mb-0">Create New Travel Post</h4>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <h5 className="text-muted mb-3">
                  <FontAwesomeIcon icon={faStickyNote} className="me-2" />
                  Share your travel experience
                </h5>
                <p className="text-muted">
                  Write about your destination, tips, and recommendations for fellow travelers.
                </p>
              </div>
              <Notes showAlert={props.showAlert} />
            </Card.Body>
            <Card.Footer className="bg-light">
              <small className="text-muted">
                Your post will be visible to the TravelBuddy community
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePost;