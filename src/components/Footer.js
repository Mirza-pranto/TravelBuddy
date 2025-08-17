import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-5">
            <div className="container">
                <div className="row">
                    {/* About Column */}
                    <div className="col-md-4 mb-4">
                        <h5 className="text-success mb-3">
                            <FontAwesomeIcon icon={faGlobe} className="me-2" />
                            TravelBuddy
                        </h5>
                        <p>
                            Connecting travelers worldwide to share experiences, find travel partners,
                            and discover hidden gems around the globe.
                        </p>
                        <div className="social-icons mt-3">
                            <a href="#" className="text-white me-3">
                                <FontAwesomeIcon icon={faFacebook} size="lg" />
                            </a>
                            <a href="#" className="text-white me-3">
                                <FontAwesomeIcon icon={faTwitter} size="lg" />
                            </a>
                            <a href="#" className="text-white me-3">
                                <FontAwesomeIcon icon={faInstagram} size="lg" />
                            </a>
                            <a href="#" className="text-white">
                                <FontAwesomeIcon icon={faLinkedin} size="lg" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="col-md-2 mb-4">
                        <h5 className="text-success mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="/" className="text-white text-decoration-none">Home</a></li>
                            <li className="mb-2"><a href="/about" className="text-white text-decoration-none">About</a></li>
                            <li className="mb-2"><a href="/dashboard" className="text-white text-decoration-none">Profile</a></li>
                            <li className="mb-2"><a href="/createpost" className="text-white text-decoration-none">Create Post</a></li>
                            <li><a href="/my-requests" className="text-white text-decoration-none">My Requests</a></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="col-md-3 mb-4">
                        <h5 className="text-success mb-3">Contact Us</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                123 Travel Street, Wanderlust City
                            </li>
                            <li className="mb-3">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                contact@travelbuddy.com
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faPhone} className="me-2" />
                                +1 (123) 456-7890
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="col-md-3 mb-4">
                        <h5 className="text-success mb-3">Newsletter</h5>
                        <p>Subscribe to get travel tips and updates</p>
                        <div className="input-group mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Your email"
                                aria-label="Your email"
                            />
                            <button className="btn btn-success" type="button">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="row pt-3 border-top border-secondary">
                    <div className="col-12 text-center">
                        <p className="mb-0 text-muted">
                            &copy; {new Date().getFullYear()} TravelBuddy. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;