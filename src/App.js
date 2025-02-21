import React from 'react';
import { useLottie } from 'lottie-react';
import artificialAnimation from './lotties/ai-model-operation.json';
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
import Documentation from './Documentation';
import Action from './Admin/Action';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.5,
};

/**
 * This component now ONLY displays the Lottie AI animation,
 * centered on the page. All Three.js / background particles
 * have been removed.
 */
const CenteredAIAnimation = () => {
  const options = {
    animationData: artificialAnimation,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-0 opacity-5">
      {/* Adjust width/height as needed, or leave it auto. */}
      <div style={{ width: '800px', height: '800px'}}>
        {View}
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();

  return (
    <div className="app-container relative min-h-screen">
      {/* Only the AI Animation, centered on the page */}
      <CenteredAIAnimation />

      <div className="relative z-10">
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <MainPage />
                  </motion.div>
                }
              />
              <Route
                path="/documentation"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Documentation />
                  </motion.div>
                }
              />
              <Route
                path="/login"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AdminLogin />
                  </motion.div>
                }
              />
              <Route
                path="/login/set-security-questions"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SetSecurityQuestions />
                  </motion.div>
                }
              />
              <Route
                path="/login/recover-password"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <RecoverPassword />
                  </motion.div>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin-dashboard/*"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
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
                }
              />

              {/* Protected Security In-Charge Routes */}
              <Route
                path="/incharge-dashboard/*"
                element={
                  <ProtectedRoute roles={['security_incharge']}>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Routes>
                        <Route index element={<InchargeDashboard />} />
                        <Route path="manage-alerts" element={<ManageAlerts />} />
                        <Route path="discipline-cases" element={<DisciplineCases />} />
                        <Route path="action" element={<Action />} />
                        <Route path="camera-scan" element={<CameraScan />} />
                      </Routes>
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              {/* Error / Fallback Routes */}
              <Route
                path="/unauthorized"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Unauthorized />
                  </motion.div>
                }
              />
              <Route
                path="*"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <NotFound />
                  </motion.div>
                }
              />
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
