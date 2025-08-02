import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import noteContext from '../context/notes/noteContext';

const Postcard = () => {
  const { id } = useParams();
  const context = useContext(noteContext);
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await context.getNoteById(id); // must be defined in context
        if (response) setPost(response);
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    };

    fetchPost();
  }, [id, context]);

  if (!post) {
    return <div className="container mt-5"><h3>Loading post details...</h3></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">{post.title}</h2>
      <p><strong>Destination:</strong> {post.destination}</p>
      <p><strong>Travel Type:</strong> {post.travelType}</p>
      <p><strong>Budget:</strong> ${post.budget}</p>
      <p><strong>Start Date:</strong> {new Date(post.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(post.endDate).toLocaleDateString()}</p>
      <p><strong>Description:</strong></p>
      <p>{post.description}</p>
    </div>
  );
};

export default Postcard;
