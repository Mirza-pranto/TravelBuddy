import React from 'react';

const About = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">About TravelBuddy</h1>
        <p className="lead text-muted">Your ultimate companion for unforgettable journeys</p>
      </div>

      <div className="row align-items-center">
        <div className="col-md-6 mb-4 mb-md-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" // You can replace this with a local image or better URL
            className="img-fluid rounded shadow"
            alt="Travel the world"
          />
        </div>
        <div className="col-md-6">
          <h3 className="fw-semibold">Our Mission</h3>
          <p className="text-muted">
            At <strong>TravelBuddy</strong>, we believe that every journey should be easy to plan, fun to share, and memorable to experience. 
            Our platform connects travelers with like-minded companions, tailored trips, and smart travel tools — all in one place.
          </p>
          <p className="text-muted">
            Whether you're an adventurer, a chill beach lover, or a cultural explorer, we’re here to help you discover new destinations, share travel stories, and create unforgettable moments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
