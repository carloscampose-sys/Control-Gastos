import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-contact">
          <p className="footer-text">Contáctame para darme tus sugerencias</p>
          <div className="footer-email">
            <FaEnvelope className="email-icon" />
            <a href="mailto:ismaelespinoza27ik@gmail.com" className="email-link">
              ismaelespinoza27ik@gmail.com
            </a>
          </div>
        </div>
        <div className="footer-project">
          <p className="project-text">Proyecto de Investigación e Innovación Tecnológica</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;