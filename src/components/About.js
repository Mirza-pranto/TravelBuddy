import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobeAmericas, 
  faUsers, 
  faRoute, 
  faHeart,
  faMapMarkedAlt,
  faLaughBeam
} from '@fortawesome/free-solid-svg-icons';

const About = () => {
  const features = [
    {
      icon: faGlobeAmericas,
      title: "Global Community",
      description: "Connect with travelers from around the world"
    },
    {
      icon: faUsers,
      title: "Find Travel Buddies",
      description: "Meet like-minded people for your next adventure"
    },
    {
      icon: faRoute,
      title: "Custom Itineraries",
      description: "Plan your perfect trip with our tools"
    },
    {
      icon: faMapMarkedAlt,
      title: "Hidden Gems",
      description: "Discover off-the-beaten-path locations"
    },
    {
      icon: faLaughBeam,
      title: "Shared Experiences",
      description: "Create memories with new friends"
    },
    {
      icon: faHeart,
      title: "Passionate Team",
      description: "We're travelers helping travelers"
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="hero-section bg-success text-white py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-3 fw-bold mb-4">About TravelBuddy</h1>
              <p className="lead mb-4">
                Your ultimate companion for unforgettable journeys around the globe
              </p>
              <button className="btn btn-light btn-lg px-4">
                Join Our Community
              </button>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img 
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60" 
                className="img-fluid rounded shadow-lg" 
                alt="Travel group" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src="https://images.unsplash.com/photo-1506929562872-bb421503ef21"
              className="img-fluid rounded shadow-lg"
              alt="Travel mission"
            />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold mb-4 text-success">Our Mission</h2>
            <p className="fs-5 mb-4">
              At <strong>TravelBuddy</strong>, we're revolutionizing the way people travel by creating meaningful connections between adventurers worldwide.
            </p>
            <p className="fs-5 mb-4">
              We believe travel should be about shared experiences, authentic connections, and discovering the world through local perspectives.
            </p>
            <div className="d-flex align-items-center mb-3">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <FontAwesomeIcon icon={faHeart} className="text-success fs-4" />
              </div>
              <p className="mb-0">Founded by passionate travelers for passionate travelers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-light py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-success">Why Choose TravelBuddy?</h2>
            <p className="lead text-muted">We make your travel experiences better in every way</p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div className="col-md-4" key={index}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="icon-wrapper bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                      <FontAwesomeIcon icon={feature.icon} className="text-success fs-3" />
                    </div>
                    <h5 className="fw-bold">{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team CTA */}
      <div className="container py-5 my-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2 className="fw-bold mb-4">Ready to Start Your Adventure?</h2>
            <p className="lead mb-4">
              Join thousands of travelers who are already making unforgettable memories with TravelBuddy
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-success btn-lg px-4">
                Sign Up Now
              </button>
              <button className="btn btn-outline-success btn-lg px-4">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;