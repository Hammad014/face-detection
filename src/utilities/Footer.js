import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 px-8 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            {/* Contact Information */}
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold text-white mb-2">Contact Us</h3>
              <p className="text-gray-400">Comsats University Abbottabad</p>
              <p className="text-gray-400">Email: <a href="mailto:support@face-trace.com" className="hover:underline">support@face-trace.com</a></p>
              <p className="text-gray-400">Phone: <a href="tel:+92511234567" className="hover:underline">+92-51-1234567</a></p>
            </div>
            {/* Additional Info */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Legal</h3>
              <p className="text-gray-400">&copy; {new Date().getFullYear()} Comsats Uni FaceTrace. All rights reserved.</p>
            </div>
          </div>
        </footer>
  );
};

export default Footer;
