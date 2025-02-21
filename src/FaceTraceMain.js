// src/MainPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MdSecurity } from "react-icons/md";
import Footer from './utilities/Footer';
import { Link } from 'react-router-dom';
import {
  FaRegSmileBeam,
  FaExclamationTriangle,
  FaUserCheck,
  FaBell,
  FaIdCard,
  FaGavel,
  FaUserShield,
  FaDesktop,
  FaUserPlus,
  FaBars,
  FaTimes,
  FaCogs,
  FaInfoCircle,
  FaFileAlt,
} from 'react-icons/fa';
import { animateScroll as scroll, scroller } from 'react-scroll';

// 1) Import Lottie
import Lottie from 'lottie-react';

// 2) Import your Lottie JSON animation files
import secureLoginAnimation from './lotties/secure-login.json';
import dashboardAccessAnimation from './lotties/dashboard-access.json';
import registrationAnimation from './lotties/member-registration.json';
import aiOperationAnimation from './lotties/face-recognition.json';
import alertsAnimation from './lotties/alerts.json'; // or replace with your own

const MainPage = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const mountRef = useRef(null);

  // How-It-Works data with a new “Alerts” card
  const howItWorksData = [
    {
      title: 'Secure Login System',
      animation: secureLoginAnimation,
      details: `
        Implement robust user authentication with advanced security protocols. 
        Admin and security in-charge can log in using credentials provided by the institution.
        After login passwords can be chnages using the given options.
        This prevents any unauthorized access.
      `,
    },
    {
      title: 'Dashboard Access',
      animation: dashboardAccessAnimation,
      details: `
        After successful login, each user sees a custom dashboard.
        Admin sees system stats, user registrations, and more.
        Security in-charge monitors live feeds and violation alerts.
        Administrator will have more previleges to control the system.
      `,
    },
    {
      title: 'Member Registration',
      animation: registrationAnimation,
      details: `
        Register new members (students, faculty, staff) with photos and other data.
        Data is securely stored to enable smooth recognition throughout campus.
        Person can be deleted or modified thorugh the system.
      `,
    },
    {
      title: 'AI Model Operation',
      animation: aiOperationAnimation,
      details: `
        A deep learning model continuously trains on captured faces.
        A labeled data given to the model during registration and model trains on it. By runnning camera it recognizes the known or unknown faces for security purpose.
        It quickly identifies individuals in real-time, raising alerts on unauthorized entries.
      `,
    },
    {
      title: 'Instant Alerts',
      animation: alertsAnimation,
      details: `
        The system sends real-time alerts to the Security In-charge whenever
        a banned or unauthorized person is detected. Immediate notifications
        allow swift action to maintain campus safety.
        Known and Unknown alerts recives by the previleged users every time when face comes in front of camera.
        Also allows the known but restricted person detection alerts.
      `,
    },
  ];

  // Three.js background effect
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    const colors = [];
    const colorPalette = [
      new THREE.Color(0x1a1a2e),
      new THREE.Color(0x16213e),
      new THREE.Color(0x0f3460),
      new THREE.Color(0xe94560),
    ];

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 10;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const color =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors.push(color.r, color.g, color.b);
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // Lines
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * 3);
    let index = 0;
    for (let i = 0; i < particleCount; i++) {
      if (Math.random() > 0.97) {
        linePositions[index++] = posArray[i * 3];
        linePositions[index++] = posArray[i * 3 + 1];
        linePositions[index++] = posArray[i * 3 + 2];
        linePositions[index++] =
          posArray[((i + 1) % particleCount) * 3];
        linePositions[index++] =
          posArray[((i + 1) % particleCount) * 3 + 1];
        linePositions[index++] =
          posArray[((i + 1) % particleCount) * 3 + 2];
      }
    }

    linesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4f8bf5,
      transparent: true,
      opacity: 0.15,
    });

    const lineMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lineMesh);

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particleMesh.rotation.x += 0.0005;
      particleMesh.rotation.y += 0.0005;
      lineMesh.rotation.x += 0.0005;
      lineMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    scroller.scrollTo(sectionId, {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
    });
    setIsNavOpen(false);
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  return (
    <>
      {/* Three.js Background */}
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0" />

      <div className="relative z-10">
        {/* Header */}
        <header className="w-full bg-gradient-to-b from-gray-900/90 to-transparent top-0 left-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-32">
              <div className="flex-shrink-0">
                <img
                  src="face-trace-logo.png"
                  alt="FaceTrace Logo"
                  className="h-28 hover:scale-125 transition-transform duration-300"
                />
              </div>

              <div className="md:hidden">
                <button
                  onClick={toggleNav}
                  className="text-gray-300 hover:text-white focus:outline-none"
                >
                  {isNavOpen ? (
                    <FaTimes className="h-6 w-6" />
                  ) : (
                    <FaBars className="h-6 w-6" />
                  )}
                </button>
              </div>

              <nav
                className={`md:flex md:items-center ${
                  isNavOpen ? 'block' : 'hidden'
                } absolute md:static bg-gray-900/90 md:bg-transparent top-32 left-0 w-full md:w-auto`}
              >
                <ul
                  className={`flex flex-col items-center md:flex-row md:space-x-4 ${
                    isNavOpen ? 'space-y-6 py-4' : ''
                  }`}
                >
                  <li>
                    <Link
                      to="/documentation"
                      className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold transition-all duration-200 hover:bg-gray-800/50"
                    >
                      <FaFileAlt className="mr-2" />
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="flex items-center text-gray-300 hover:text-white font-bold px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-800/50"
                    >
                      <FaCogs className="mr-2" />
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('about-face-trace')}
                      className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold transition-all duration-200 hover:bg-gray-800/50"
                    >
                      <FaInfoCircle className="mr-2" />
                      About
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 ml-4 font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaUserCheck className="mr-2" />
                      Sign In
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-transparent text-white z-10 p-8 mt-3">
          {/* Hero */}
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold mt-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
              Welcome to COMSATS FaceTrace
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Revolutionizing campus security through AI-powered facial
              recognition technology
            </p>
          </div>

          {/* Core Features */}
          <div className="mt-20 px-5">
            
            <h2 className="text-3xl font-bold mb-20 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Core Features of FaceTrace
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <FaIdCard className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">
                  Comprehensive Registration
                </h3>
                <p>
                  Complete registration of students, faculty, and workers with
                  secure data handling.
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <FaRegSmileBeam className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">
                  Real-Time Recognition
                </h3>
                <p>
                  Identification of individuals through advanced facial
                  recognition system.
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <MdSecurity className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">Violations Record</h3>
                <p>Updating the record of persons who have made any violations.</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <FaExclamationTriangle className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
                <p>
                  Automated alerts after identification of known and unknown
                  persons.
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <FaUserCheck className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">
                  Attendance Management
                </h3>
                <p>Efficient tracking and management of faculty attendance records.</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center hover:scale-105 transition-transform duration-300 border border-transparent hover:border-blue-500">
                <FaBell className="text-blue-500 mx-auto mb-4 text-4xl" />
                <h3 className="text-xl font-semibold mb-2">
                  Real-Time Notifications
                </h3>
                <p>
                  Notifications for administrator devices to take action on
                  unknown person detection.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          
<div id="how-it-works" className="mt-24 px-4">
  <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
    How It Works
  </h2>

  <div className="max-w-5xl mx-auto space-y-10">
    {howItWorksData.map((item, index) => (
      <div
        key={index}
        className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} 
          items-center gap-8 md:gap-12 p-6 md:p-8 
          border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300`}
      >
        {/* Text Content */}
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-bold text-center md:text-left">{item.title}</h3>
          <p className="text-gray-300 leading-relaxed text-center md:text-left">
            {item.details}
          </p>
        </div>

        {/* Animation Column */}
        <div className="flex-1 w-full max-w-[500px]">
          <Lottie
            animationData={item.animation}
            loop={true}
            className="w-full h-64 md:h-80"
          />
        </div>
      </div>
    ))}
  </div>
</div>
{/* About Section */}
<div id="about-face-trace" className="mt-28 px-4 md:px-8 lg:px-16">
            <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              About FaceTrace
            </h2>
            <div className="max-w-6xl mx-auto text-gray-300 space-y-6">
              <p className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-sm">
                FaceTrace is a cutting-edge facial recognition system tailored
                exclusively for Comsats University Abbottabad. By leveraging
                state-of-the-art algorithms, FaceTrace ensures robust campus
                security, accurately identifying and monitoring individuals
                in real-time.
              </p>
              <p className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-sm">
                The system maintains a comprehensive database of authorized
                personnel, including students, faculty, and staff, ensuring that
                only registered individuals can access campus facilities.
                FaceTrace proactively detects and alerts security personnel
                about any unauthorized access attempts, enhancing overall campus
                safety.
              </p>
              <p className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-sm">
                Beyond security, FaceTrace streamlines administrative tasks such
                as attendance management and disciplinary case handling. The
                seamless integration of these features ensures data integrity
                and operational efficiency, allowing administrators to focus on
                enhancing the educational environment.
              </p>
              <p className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/30 backdrop-blur-sm">
                Continuous updates and secure data handling mechanisms ensure
                that FaceTrace remains reliable and effective in maintaining the
                integrity of campus operations. With its user-friendly interface
                and real-time capabilities, FaceTrace stands as a vital tool in
                modernizing campus security and administration.
              </p>
            </div>

            {/* "Know More" Button Below About Section */}
            <div className="flex justify-center mt-8">
              <Link
                to="/documentation"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Know More
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default MainPage;
