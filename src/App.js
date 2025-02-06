// // src/App.js


// src/App.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainPage from './FaceTraceMain';
import AdminLogin from './Admin/AdminLogin';
import AdminDashboard from './Admin/AdminDashboard';
import InchargeDashboard from './SecurityIncharge/InchargeDashboard';
import RegisterUser from './Admin/RegisterUser';
import ManageAlerts from './Admin/ManageAlerts';
import ManageAttendance from './Admin/ManageAttendance';
import CameraScan from './Admin/CameraScan';
import RecoverPassword from './RecoverPassword';
import SetSecurityQuestions from './SecurityQuestions';
import UpdatePerson from './Admin/UpdatePerson';
import DeletePerson from './Admin/DeletePerson';
import DisciplineCases from './Admin/DisciplineCases';
import Unauthorized from './utilities/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import NotFound from './utilities/NotFound';
import AuthProvider from './AuthContext';
import Settings from './utilities/Settings';
import Action from './Admin/Action';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.5
};

const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Particles setup
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    const colors = [];
    const colorPalette = [
      new THREE.Color(0x1a1a2e),
      new THREE.Color(0x16213e),
      new THREE.Color(0x0f3460),
      new THREE.Color(0xe94560)
    ];

    for(let i = 0; i < particleCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 10;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 10;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors.push(color.r, color.g, color.b);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // Neural connections
    const linesGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * 3);
    let index = 0;

    for(let i = 0; i < particleCount; i++) {
      if(Math.random() > 0.97) {
        linePositions[index++] = posArray[i * 3];
        linePositions[index++] = posArray[i * 3 + 1];
        linePositions[index++] = posArray[i * 3 + 2];
        linePositions[index++] = posArray[(i+1) * 3 % particleCount];
        linePositions[index++] = posArray[(i+1) * 3 + 1 % particleCount];
        linePositions[index++] = posArray[(i+1) * 3 + 2 % particleCount];
      }
    }

    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4f8bf5,
      transparent: true,
      opacity: 0.15
    });

    const lineMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lineMesh);

    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      particleMesh.rotation.x += 0.0005;
      particleMesh.rotation.y += 0.0005;
      lineMesh.rotation.x += 0.0005;
      lineMesh.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};

function App() {
  const location = useLocation();

  return (
    <div className="app-container relative min-h-screen">
      <ParticleBackground />
      
      <div className="relative z-10">
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <MainPage />
                </motion.div>
              } />
              
              <Route path="/login" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <AdminLogin />
                </motion.div>
              } />
              
              <Route path="/login/set-security-questions" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <SetSecurityQuestions />
                </motion.div>
              } />
              
              <Route path="/login/recover-password" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <RecoverPassword />
                </motion.div>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin-dashboard/*" element={
                <ProtectedRoute roles={['admin']}>
                  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="register-user" element={<RegisterUser />} />
                      <Route path="update-person" element={<UpdatePerson />} />
                      <Route path="delete-person" element={<DeletePerson />} />
                      <Route path="manage-alerts" element={<ManageAlerts />} />
                      <Route path="manage-attendance" element={<ManageAttendance />} />
                      <Route path="discipline-cases" element={<DisciplineCases />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="camera-scan" element={<CameraScan />} />
                    </Routes>
                  </motion.div>
                </ProtectedRoute>
              } />

              {/* Protected Security In-Charge Routes */}
              <Route path="/incharge-dashboard/*" element={
                <ProtectedRoute roles={['security_incharge']}>
                  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <Routes>
                      <Route index element={<InchargeDashboard />} />
                      <Route path="manage-alerts" element={<ManageAlerts />} />
                      <Route path="discipline-cases" element={<DisciplineCases />} />
                      <Route path="action" element={<Action />} />
                      <Route path="camera-scan" element={<CameraScan />} />
                    </Routes>
                  </motion.div>
                </ProtectedRoute>
              } />

              {/* Error Routes */}
              <Route path="/unauthorized" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <Unauthorized />
                </motion.div>
              } />
              
              <Route path="*" element={
                <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                  <NotFound />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;



// import React from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom';
// import { AnimatePresence, motion } from 'framer-motion';
// import MainPage from './FaceTraceMain.js';
// import AdminLogin from './Admin/AdminLogin.js';
// import AdminDashboard from './Admin/AdminDashboard.js';
// import InchargeDashboard from './SecurityIncharge/InchargeDashboard.js';
// import RegisterUser from './Admin/RegisterUser.js';
// import ManageAlerts from './Admin/ManageAlerts';
// import ManageAttendance from './Admin/ManageAttendance';
// import CameraScan from './Admin/CameraScan.js';
// import RecoverPassword from './RecoverPassword.js';
// import SetSecurityQuestions from './SecurityQuestions.js';
// import UpdatePerson from './Admin/UpdatePerson.js';
// import DeletePerson from './Admin/DeletePerson.js';
// import DisciplineCases from './Admin/DisciplineCases.js';
// import Unauthorized from './utilities/Unauthorized.js';
// import ProtectedRoute from './ProtectedRoute.js';
// import NotFound from './utilities/NotFound.js';
// import AuthProvider from './AuthContext.js';
// import Settings from './utilities/Settings.js';
// import Action from './Admin/Action.js';
// import './index.css';

// const pageVariants = {
//   initial: {
//     opacity: 0,
//     y: 50,
//   },
//   in: {
//     opacity: 1,
//     y: 0,
//   },
//   out: {
//     opacity: 0,
//     y: -50,
//   },
// };

// const pageTransition = {
//   type: 'tween',
//   ease: 'easeInOut',
//   duration: 0.5,
// };

// function App() {
//   const location = useLocation();

//   return (
//     <div className="app-container relative min-h-screen">
//       {/* Global Particle Background */}
//       <div className="particles absolute inset-0 -z-10"></div>

//       {/* Application Routes with Animation */}
//       <div className="relative z-10">
//       <AuthProvider>
//         <AnimatePresence mode="wait">
//           <Routes location={location} key={location.pathname}>
//             {/* Public Routes */}
//             <Route
//               path="/"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <MainPage />
//                 </motion.div>
//               }
//             />
//             <Route
//               path="/login"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <AdminLogin />
//                 </motion.div>
//               }
//             />
//             <Route
//               path="/login/set-security-questions"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <SetSecurityQuestions />
//                 </motion.div>
//               }
//             />
//             <Route
//               path="/login/recover-password"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <RecoverPassword />
//                 </motion.div>
//               }
//             />

//             {/* Protected Routes for Admin */}
//             <Route
//               path="/admin-dashboard/*"
//               element={
//                 <ProtectedRoute roles={['admin']}>
//                   <motion.div
//                     initial="initial"
//                     animate="in"
//                     exit="out"
//                     variants={pageVariants}
//                     transition={pageTransition}
//                   >
//                     <Routes>
//                       <Route path="" element={<AdminDashboard />} />
//                       <Route path="register-user" element={<RegisterUser />} />
//                       <Route path="update-person" element={<UpdatePerson />} />
//                       <Route path="delete-person" element={<DeletePerson />} />
//                       <Route path="manage-alerts" element={<ManageAlerts />} />
//                       <Route path="manage-attendance" element={<ManageAttendance />} />
//                       <Route path="discipline-cases" element={<DisciplineCases />} />
//                       <Route path="settings" element={<Settings />} />
//                       {/* Add other admin routes here */}
//                     </Routes>
//                   </motion.div>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Protected Routes for Security In-Charge */}
//             <Route
//               path="/incharge-dashboard/*"
//               element={
//                 <ProtectedRoute roles={['security_incharge']}>
//                   <motion.div
//                     initial="initial"
//                     animate="in"
//                     exit="out"
//                     variants={pageVariants}
//                     transition={pageTransition}
//                   >
//                     <Routes>
//                       <Route path="" element={<InchargeDashboard />} />
//                       <Route path="manage-alerts" element={<ManageAlerts />} />
//                       <Route path="discipline-cases" element={<DisciplineCases />} />
//                       <Route path="action" element={<Action />} />
//                       {/* Add other incharge routes here */}
//                     </Routes>
//                   </motion.div>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Unauthorized Access Route */}
//             <Route
//               path="/unauthorized"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <Unauthorized />
//                 </motion.div>
//               }
//             />

//             {/* Catch-All Route */}
//             <Route
//               path="*"
//               element={
//                 <motion.div
//                   initial="initial"
//                   animate="in"
//                   exit="out"
//                   variants={pageVariants}
//                   transition={pageTransition}
//                 >
//                   <NotFound />
//                 </motion.div>
//               }
//             />
//           </Routes>
//         </AnimatePresence>
//         </AuthProvider>
//       </div>
//     </div>
//   );
// }

// export default App;
