import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import noteContext from '../context/notes/noteContext';
import Comments from './Comments';

const Postcard = ({ showAlert }) => {
  const { id } = useParams();
  const context = useContext(noteContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await context.getNoteById(id);
        if (response) {
          setPost(response);
        } else {
          showAlert && showAlert("Post not found", "error");
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        showAlert && showAlert("Error loading post", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id && context.getNoteById) {
      fetchPost();
    }
  }, [id, context, showAlert]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3">Loading post details...</h3>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mt-5 text-center">
        <h3>Post not found</h3>
        <p>The post you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 bg-light p-4 rounded">
      <div className="row">
        <div className="col-12">
          {/* Post Details */}
          <div className="card mb-4">
            <div className="card-body">
              <h1 className="card-title mb-4">{post.title}</h1>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Destination:</strong> {post.destination}</p>
                  <p><strong>Travel Type:</strong> {post.travelType}</p>
                  <p><strong>Budget:</strong> ${post.budget}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Start Date:</strong> {new Date(post.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(post.endDate).toLocaleDateString()}</p>
                  {post.tag && <p><strong>Tag:</strong> {post.tag}</p>}
                </div>
              </div>
              <div className="mt-3">
                <p><strong>Description:</strong></p>
                <p className="text-muted">{post.description}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-body">
              <Comments noteId={id} showAlert={showAlert} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Postcard;