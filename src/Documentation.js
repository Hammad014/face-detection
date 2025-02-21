// src/components/Documentation.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';
import Footer from './utilities/Footer'; 

// Define the animated gradient keyframes as a string.
const gradientAnimation = `
@keyframes gradientWave {
  0% { background-position-x: 0%; }
  50% { background-position-x: 100%; }
  100% { background-position-x: 0%; }
}
`;

// Initialize i18next with translations for English, Urdu, and Spanish.
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        nav: {
          logo: "",
          language: "Language",
          languages: { en: "English", ur: "Urdu", es: "Spanish" }
        },
        top: {
          giantText: "Knows and Hows ?"
        },
        documentation: {
          title: "Documentation",
          introduction: "Introduction",
          introductionDesc:
            "Welcome to the comprehensive documentation for FaceTrace, an advanced facial recognition and campus security solution specifically designed for COMSATS University Abbottabad. This documentation outlines how FaceTrace leverages cutting-edge machine learning and computer vision technologies to provide robust protection against unauthorized entry and streamline campus management.",
          background: "Background",
          backgroundDesc:
            "As the university expands and enrollment increases, traditional security measures like manual ID checks become less effective. FaceTrace was conceived to automate identity verification and ensure that only authorized individuals access campus facilities.",
          objectives: "Objectives",
          objectivesList: [
            "Automate the process of identifying individuals at entry points.",
            "Enable real-time alerts for unauthorized or banned visitors.",
            "Reduce manual dependency and guard fatigue during peak hours.",
            "Maintain a comprehensive, up-to-date record of campus members.",
            "Enhance the overall security posture of the institution."
          ],
          purpose: "Purpose",
          purposeDesc:
            "The primary purpose of FaceTrace is to provide an automated, highly accurate method of recognizing and verifying campus occupants. It improves campus safety, facilitates administrative tasks, and frees security personnel for more critical duties.",
          scope: "Scope",
          scopeDesc:
            "FaceTrace covers various functionalities essential to campus safety and efficiency – from identifying people and managing access control to maintaining a detailed database of students, faculty, and staff.",
          scopePersonIdentification: "Person Identification",
          scopePersonIdentificationDesc:
            "FaceTrace employs cutting-edge facial recognition to instantly match an individual’s face against a central database, ensuring only registered individuals access the campus.",
          scopeSecurityMonitoring: "Security Monitoring",
          scopeSecurityMonitoringDesc:
            "By connecting with live security camera feeds, FaceTrace continuously scans for known and unknown individuals, quickly flagging suspicious activity.",
          scopeAlertSystem: "Alert System",
          scopeAlertSystemDesc:
            "If an unknown or banned individual is detected, FaceTrace sends immediate alerts to security personnel.",
          scopeDataManagement: "Data Management",
          scopeDataManagementDesc:
            "A central database securely stores registration details, multiple facial images, and disciplinary records, all protected by university‑compliant encryption.",
          scopeDisciplinaryTracking: "Disciplinary Tracking",
          scopeDisciplinaryTrackingDesc:
            "Administrators can update and view records for individuals involved in any disciplinary cases.",
          scopeFacultyAttendance: "Faculty Attendance",
          scopeFacultyAttendanceDesc:
            "FaceTrace logs faculty in/out times via camera recognition, streamlining attendance tracking.",
          productPerspective: "Product Perspective",
          productPerspectiveDesc:
            "FaceTrace provides a modern, automated solution compared to traditional manual ID checks, minimizing human error and increasing efficiency.",
          operatingEnvironment: "Operating Environment",
          operatingEnvironmentDesc:
            "FaceTrace runs on high‑performance servers in secure data centers, ensuring compliance with institutional policies and local regulations.",
          operatingEnvironmentDetails: [
            "Hardware: High-performance servers (16GB+ RAM, multi‑core CPUs).",
            "Software Stack: Python (Django) backend with TensorFlow/OpenCV.",
            "Web Compatibility: Accessible via modern browsers (Chrome, Firefox, Safari, Edge).",
            "Hosting: Managed by COMSATS University’s IT Department for 24/7 availability."
          ],
          designConstraints: "Design & Implementation Constraints",
          designConstraintsDesc:
            "FaceTrace is guided by several constraints:",
          designConstraintsDetails: [
            "Language & Framework: Python (Django) and TensorFlow; OpenCV & Dlib for facial detection.",
            "Database: SQL‑based system (e.g., PostgreSQL/MySQL).",
            "Security Standards: HTTPS encryption, OWASP compliance, and regular vulnerability scans.",
            "Legal & Privacy: Must adhere to local data protection laws and university policies."
          ],
          abstract: "Abstract",
          abstractDesc:
            "COMSATS University Abbottabad faces challenges in managing security for a growing population. Manual checks are error‑prone and inefficient—FaceTrace addresses these issues with automated facial recognition, real‑time alerting, and comprehensive data management.",
          problemStatement: "Problem Statement",
          problemStatementDesc:
            "Traditional ID checking is insufficient for controlling campus access, as unauthorized or banned individuals may slip through during peak hours.",
          proposedSolution: "Proposed Solution",
          proposedSolutionDesc:
            "FaceTrace uses AI‑powered facial recognition to capture and analyze video feeds in real‑time, generating alerts for unknown or banned individuals while enabling efficient management of user data and disciplinary statuses.",
          benefits: "Benefits",
          benefitsList: [
            "Quick identification of unauthorized individuals.",
            "Real‑time alerts for security personnel.",
            "Streamlined administrative tasks such as attendance and discipline management.",
            "Reduced manual verification for security guards.",
            "Enhanced overall campus safety."
          ],
          modules: "Modules",
          modulesDesc:
            "FaceTrace comprises several interlinked modules that provide a cohesive security solution:",
          modulesUserRegistration: "User Registration",
          modulesUserRegistrationDesc:
            "Admins register students, faculty, and staff using official university data, capturing multiple facial images and unique IDs.",
          modulesDatabaseManagement: "Database Management",
          modulesDatabaseManagementDesc:
            "All user data, disciplinary records, and attendance logs are stored securely in a SQL‑based database with strict access controls.",
          modulesCameraIntegration: "Camera Integration",
          modulesCameraIntegrationDesc:
            "FaceTrace integrates with dedicated security camera feeds to capture facial data in real‑time and compare it to stored records.",
          modulesAlertSystem: "Alert System",
          modulesAlertSystemDesc:
            "Upon detecting an unknown or banned individual, FaceTrace triggers an automated alert with relevant details.",
          modulesAttendanceTracking: "Attendance Tracking",
          modulesAttendanceTrackingDesc:
            "Faculty attendance is automatically logged based on camera recognition, eliminating manual rosters.",
          systemLimitations: "System Limitations",
          systemLimitationsList: [
            "Face Coverings: Masks or veils may hinder identification until removed.",
            "Single Camera Integration: Currently optimized for one camera feed.",
            "Continuous Training: Recognition accuracy requires periodic updates with new data.",
            "Environmental Factors: Poor lighting or obstructions can affect image clarity."
          ]
        }
      }
    },
    ur: {
      translation: {
        nav: {
          logo: "",
          language: "زبان",
          languages: { en: "انگریزی", ur: "اردو", es: "ہسپانوی" }
        },
        top: {
          giantText: "جانکاری اور طریقے؟"
        },
        documentation: {
          title: "دستاویز",
          introduction: "تعارف",
          introductionDesc:
            "فیس ٹریس کے جامع دستاویز میں خوش آمدید، جو COMSATS University Abbottabad کے لیے ایک جدید چہرہ شناخت اور کیمپس سیکیورٹی حل ہے۔ یہ دستاویز بتاتی ہے کہ فیس ٹریس جدید مشین لرننگ اور کمپیوٹر وژن ٹیکنالوجیز کے ذریعے غیر مجاز داخلے سے بچاؤ اور کیمپس انتظام کو کیسے بہتر بناتا ہے۔",
          background: "پس منظر",
          backgroundDesc:
            "جب یونیورسٹی میں داخلہ بڑھتا ہے تو روایتی سیکورٹی اقدامات جیسے ID چیکس کم موثر ہو جاتے ہیں۔ فیس ٹریس کو خودکار شناخت اور صرف مجاز افراد کی رسائی یقینی بنانے کے لیے تخلیق کیا گیا۔",
          objectives: "مقاصد",
          objectivesList: [
            "داخلے کے مقامات پر افراد کی شناخت کو خودکار بنانا۔",
            "غیر مجاز یا ممنوع افراد کے لیے فوری الرٹس۔",
            "پییک کے اوقات میں دستی کام اور تھکن کو کم کرنا۔",
            "کیمپس ممبران کا جامع اور تازہ ریکارڈ رکھنا۔",
            "ادارے کی مجموعی سیکورٹی کو بہتر بنانا۔"
          ],
          purpose: "مقصد",
          purposeDesc:
            "فیس ٹریس کا بنیادی مقصد ایک خودکار اور انتہائی درست طریقہ فراہم کرنا ہے جس سے کیمپس کے افراد کی شناخت کی جائے، سیکورٹی بہتر ہو اور انتظامی کام آسان ہوں۔",
          scope: "حدود",
          scopeDesc:
            "فیس ٹریس مختلف فعالیتیں فراہم کرتا ہے جن میں افراد کی شناخت، داخلے کا کنٹرول اور ڈیٹا کا جامع ریکارڈ شامل ہے۔",
          scopePersonIdentification: "شخص کی شناخت",
          scopePersonIdentificationDesc:
            "فیس ٹریس جدید چہرہ شناخت کا استعمال کرتا ہے تاکہ صرف رجسٹرڈ افراد کو پہچانا جا سکے۔",
          scopeSecurityMonitoring: "سیکیورٹی مانیٹرنگ",
          scopeSecurityMonitoringDesc:
            "لائیو کیمروں کے ذریعے مشتبہ افراد کی نگرانی کی جاتی ہے اور فوری الرٹس بھیجے جاتے ہیں۔",
          scopeAlertSystem: "الرٹ سسٹم",
          scopeAlertSystemDesc:
            "غیر مجاز یا ممنوع افراد کی شناخت پر فوری الرٹس بھیجے جاتے ہیں۔",
          scopeDataManagement: "ڈیٹا مینجمنٹ",
          scopeDataManagementDesc:
            "تمام رجسٹریشن تفصیلات اور ریکارڈز کو محفوظ SQL ڈیٹا بیس میں رکھا جاتا ہے، جسے یونیورسٹی کی پالیسی کے مطابق انکرپٹ کیا جاتا ہے۔",
          scopeDisciplinaryTracking: "ضابطہ اخلاق کی نگرانی",
          scopeDisciplinaryTrackingDesc:
            "ایڈمنز ان افراد کا ریکارڈ اپ ڈیٹ اور دیکھ سکتے ہیں جو ضابطہ اخلاق کے مسائل میں ملوث ہوں۔",
          scopeFacultyAttendance: "فیکلٹی حاضری",
          scopeFacultyAttendanceDesc:
            "فیس ٹریس کیمرے کی شناخت کے ذریعے فیکلٹی کے داخلے اور خروج کا ریکارڈ رکھتا ہے۔",
          productPerspective: "پروڈکٹ نقطہ نظر",
          productPerspectiveDesc:
            "فیس ٹریس روایتی کارڈ چیکس کے مقابلے میں ایک جدید، خودکار حل پیش کرتا ہے جس سے انسانی غلطیوں کے امکانات کم ہوتے ہیں۔",
          operatingEnvironment: "آپریٹنگ ماحول",
          operatingEnvironmentDesc:
            "فیس ٹریس کو محفوظ ڈیٹا سینٹرز میں چلایا جاتا ہے، جس سے ادارتی پالیسیوں اور مقامی قواعد کی پاسداری ہوتی ہے۔",
          operatingEnvironmentDetails: [
            "ہارڈ ویئر: اعلی کارکردگی والے سرورز (16GB+ RAM، ملٹی کور CPUs).",
            "سافٹ ویئر اسٹیک: Python (Django) کے ساتھ TensorFlow/OpenCV.",
            "ویب مطابقت: جدید براؤزرز (Chrome, Firefox, Safari, Edge).",
            "ہوسٹنگ: COMSATS University کے IT ڈیپارٹمنٹ کے زیرِ انتظام 24/7 دستیابی."
          ],
          designConstraints: "ڈیزائن اور عملدرآمد کی حدود",
          designConstraintsDesc:
            "فیس ٹریس کے ڈیزائن کی ہدایات درج ذیل حدود پر مبنی ہیں:",
          designConstraintsDetails: [
            "زبان اور فریم ورک: Python (Django) اور TensorFlow؛ OpenCV & Dlib چہرہ شناخت کے لیے.",
            "ڈیٹا بیس: SQL پر مبنی نظام (مثلاً PostgreSQL/MySQL).",
            "سیکیورٹی معیارات: HTTPS انکرپشن، OWASP کی تعمیل اور باقاعدہ سکیننگ.",
            "قانونی اور پرائیویسی: مقامی ڈیٹا تحفظ قوانین اور یونیورسٹی کی پالیسیوں کے مطابق."
          ],
          abstract: "خلاصہ",
          abstractDesc:
            "COMSATS University Abbottabad بڑے پیمانے پر طلباء، فیکلٹی اور عملے کی حفاظت کے چیلنجز سے دوچار ہے۔ دستی چیکس اکثر غلطیاں اور ناکارآمدی کا باعث بنتے ہیں۔ فیس ٹریس خودکار چہرہ شناخت اور فوری الرٹس کے ذریعے ان مسائل کا حل پیش کرتا ہے۔",
          problemStatement: "مسئلہ بیان",
          problemStatementDesc:
            "روایتی ID چیکس کافی نہیں ہیں، جس سے غیر مجاز افراد یا ممنوعہ افراد داخل ہو سکتے ہیں۔",
          proposedSolution: "تجویز کردہ حل",
          proposedSolutionDesc:
            "فیس ٹریس ایک AI پر مبنی طریقہ اپناتا ہے جس سے لائیو ویڈیو فیڈز کا تجزیہ کر کے غیر مجاز یا ممنوع افراد کی صورت میں الرٹس جاری کی جاتی ہیں، اور انتظامی عمل کو آسان بنایا جاتا ہے۔",
          benefits: "فوائد",
          benefitsList: [
            "غیر مجاز افراد کی فوری شناخت",
            "فوری الرٹس برائے سیکیورٹی",
            "انتظامی کاموں میں آسانی (حاضری اور ضابطہ اخلاق)",
            "کم دستی تصدیق کی ضرورت",
            "کیمپس کی بہتر حفاظت"
          ],
          modules: "ماڈیولز",
          modulesDesc:
            "فیس ٹریس مختلف ماڈیولز پر مشتمل ہے جو مل کر ایک مربوط سیکورٹی حل فراہم کرتے ہیں:",
          modulesUserRegistration: "یوزر رجسٹریشن",
          modulesUserRegistrationDesc:
            "ایڈمنز، طالب علموں، فیکلٹی اور عملے کو سرکاری ڈیٹا کی بنیاد پر رجسٹر کرتے ہیں، جس میں متعدد چہرہ تصاویر اور منفرد IDs شامل ہیں۔",
          modulesDatabaseManagement: "ڈیٹا بیس مینجمنٹ",
          modulesDatabaseManagementDesc:
            "تمام ڈیٹا، ضابطہ اخلاقی ریکارڈز اور حاضری کو محفوظ SQL ڈیٹا بیس میں محفوظ کیا جاتا ہے۔",
          modulesCameraIntegration: "کیمرا انٹیگریشن",
          modulesCameraIntegrationDesc:
            "فیس ٹریس مخصوص سیکورٹی کیمرہ فیڈ کے ذریعے حقیقی وقت میں چہرہ شناخت کرتا ہے۔",
          modulesAlertSystem: "الرٹ سسٹم",
          modulesAlertSystemDesc:
            "غیر مجاز یا ممنوع فرد کی شناخت پر خودکار الرٹس جاری کی جاتی ہیں۔",
          modulesAttendanceTracking: "حاضری ٹریکنگ",
          modulesAttendanceTrackingDesc:
            "فیکلٹی کے داخلے اور خروج کو خودکار طریقے سے ریکارڈ کیا جاتا ہے۔",
          systemLimitations: "سسٹم کی حدود",
          systemLimitationsList: [
            "چہرہ ڈھکنے والے: ماسک یا نقاب شناخت میں رکاوٹ ڈال سکتے ہیں۔",
            "ایک ہی کیمرہ: صرف ایک مرکزی کیمرہ سپورٹ کیا گیا ہے۔",
            "مسلسل تربیت: باقاعدہ اپ ڈیٹس کے بغیر شناخت کی درستگی کم ہو سکتی ہے۔",
            "ماحولیاتی عوامل: کم روشنی یا رکاوٹیں تصویر کی وضاحت کو متاثر کر سکتی ہیں۔"
          ]
        }
      }
    },
    es: {
      translation: {
        nav: {
          logo: "",
          language: "Idioma",
          languages: { en: "Inglés", ur: "Urdu", es: "Español" }
        },
        top: {
          giantText: "¿Sabes y Cómo?"
        },
        documentation: {
          title: "Documentación",
          introduction: "Introducción",
          introductionDesc:
            "Bienvenido a la documentación completa de FaceTrace, una solución avanzada de reconocimiento facial y seguridad en campus diseñada específicamente para COMSATS University Abbottabad. Esta documentación detalla cómo FaceTrace utiliza tecnologías de aprendizaje automático y visión por computadora para proteger contra accesos no autorizados y optimizar la administración del campus.",
          background: "Antecedentes",
          backgroundDesc:
            "A medida que la universidad crece y aumenta la matrícula, las medidas tradicionales como la verificación manual se vuelven menos efectivas. FaceTrace fue concebido para automatizar la verificación de identidad y asegurar que solo las personas autorizadas tengan acceso al campus.",
          objectives: "Objetivos",
          objectivesList: [
            "Automatizar la identificación en los puntos de entrada.",
            "Habilitar alertas en tiempo real para visitantes no autorizados o prohibidos.",
            "Reducir la dependencia manual y la fatiga de los guardias.",
            "Mantener un registro completo y actualizado de los miembros del campus.",
            "Mejorar la seguridad general de la institución."
          ],
          purpose: "Propósito",
          purposeDesc:
            "El propósito principal de FaceTrace es proporcionar un método automatizado y preciso para reconocer y verificar a los ocupantes del campus, mejorando la seguridad y facilitando las tareas administrativas.",
          scope: "Alcance",
          scopeDesc:
            "FaceTrace abarca funcionalidades esenciales para la seguridad y eficiencia del campus, desde la identificación de personas hasta el control de acceso y el mantenimiento de una base de datos detallada.",
          scopePersonIdentification: "Identificación de Personas",
          scopePersonIdentificationDesc:
            "FaceTrace utiliza tecnología avanzada de reconocimiento facial para comparar instantáneamente la cara de una persona con la base de datos central.",
          scopeSecurityMonitoring: "Monitoreo de Seguridad",
          scopeSecurityMonitoringDesc:
            "Se conecta a cámaras de seguridad en vivo para detectar de forma continua a personas conocidas y desconocidas.",
          scopeAlertSystem: "Sistema de Alertas",
          scopeAlertSystemDesc:
            "Si se detecta a un individuo desconocido o prohibido, FaceTrace envía alertas inmediatas al personal de seguridad.",
          scopeDataManagement: "Gestión de Datos",
          scopeDataManagementDesc:
            "Una base de datos central almacena los detalles de registro, imágenes faciales y registros disciplinarios, manteniéndose seguros mediante encriptación.",
          scopeDisciplinaryTracking: "Seguimiento Disciplinario",
          scopeDisciplinaryTrackingDesc:
            "Los administradores pueden actualizar y revisar los registros de aquellos involucrados en casos disciplinarios.",
          scopeFacultyAttendance: "Asistencia del Profesorado",
          scopeFacultyAttendanceDesc:
            "FaceTrace registra automáticamente los horarios de entrada y salida del profesorado a través del reconocimiento facial.",
          productPerspective: "Perspectiva del Producto",
          productPerspectiveDesc:
            "FaceTrace ofrece una solución moderna y automatizada en contraste con las verificaciones manuales tradicionales, reduciendo errores humanos.",
          operatingEnvironment: "Entorno Operativo",
          operatingEnvironmentDesc:
            "FaceTrace está diseñado para operar en centros de datos seguros de COMSATS University, cumpliendo con las políticas institucionales y normativas locales.",
          operatingEnvironmentDetails: [
            "Hardware: Servidores de alto rendimiento (16GB+ RAM, CPUs multinúcleo).",
            "Stack de Software: Python (Django) con TensorFlow/OpenCV.",
            "Compatibilidad Web: Accesible mediante navegadores modernos (Chrome, Firefox, Safari, Edge).",
            "Hosting: Gestionado por el departamento de TI de COMSATS University para disponibilidad 24/7."
          ],
          designConstraints: "Restricciones de Diseño e Implementación",
          designConstraintsDesc:
            "FaceTrace se rige por varias limitaciones:",
          designConstraintsDetails: [
            "Lenguaje y Framework: Python (Django) y TensorFlow; OpenCV y Dlib para la detección facial.",
            "Base de Datos: Sistema basado en SQL (e.g., PostgreSQL/MySQL).",
            "Estándares de Seguridad: Encriptación HTTPS, cumplimiento de OWASP y escaneos de vulnerabilidad regulares.",
            "Legal y Privacidad: Debe cumplir con las leyes locales de protección de datos y las políticas internas de la universidad."
          ],
          abstract: "Resumen",
          abstractDesc:
            "COMSATS University Abbottabad enfrenta el desafío de gestionar la seguridad para una población en crecimiento de estudiantes, profesores y personal. Los controles manuales son ineficaces, y FaceTrace ofrece reconocimiento facial automatizado, alertas en tiempo real y gestión integral de datos.",
          problemStatement: "Declaración del Problema",
          problemStatementDesc:
            "La verificación manual de identidad es insuficiente para controlar el acceso al campus, permitiendo la entrada de individuos no autorizados o problemáticos.",
          proposedSolution: "Solución Propuesta",
          proposedSolutionDesc:
            "FaceTrace utiliza reconocimiento facial basado en IA para capturar y analizar flujos de video en tiempo real, generando alertas automáticas para individuos desconocidos o prohibidos.",
          benefits: "Beneficios",
          benefitsList: [
            "Identificación rápida de individuos no autorizados.",
            "Alertas en tiempo real para el personal de seguridad.",
            "Optimización de tareas administrativas, como la asistencia y la gestión disciplinaria.",
            "Reducción de la verificación manual.",
            "Mayor seguridad en el campus."
          ],
          modules: "Módulos",
          modulesDesc:
            "FaceTrace se compone de varios módulos interconectados que ofrecen una solución de seguridad integral:",
          modulesUserRegistration: "Registro de Usuarios",
          modulesUserRegistrationDesc:
            "Los administradores registran a estudiantes, profesores y personal utilizando datos oficiales de la universidad, capturando múltiples imágenes faciales e identificadores únicos.",
          modulesDatabaseManagement: "Gestión de la Base de Datos",
          modulesDatabaseManagementDesc:
            "Todos los datos y registros se almacenan de forma segura en una base de datos SQL con estrictos controles de acceso.",
          modulesCameraIntegration: "Integración de Cámaras",
          modulesCameraIntegrationDesc:
            "FaceTrace se integra con cámaras de seguridad dedicadas para capturar y comparar datos faciales en tiempo real.",
          modulesAlertSystem: "Sistema de Alertas",
          modulesAlertSystemDesc:
            "Cuando se detecta un individuo desconocido o prohibido, se envía una alerta automática con los detalles pertinentes.",
          modulesAttendanceTracking: "Seguimiento de Asistencia",
          modulesAttendanceTrackingDesc:
            "El sistema registra automáticamente los horarios de entrada y salida del profesorado mediante reconocimiento facial.",
          systemLimitations: "Limitaciones del Sistema",
          systemLimitationsList: [
            "Cobertura facial: El uso de máscaras o velos puede dificultar la identificación.",
            "Integración de una sola cámara: Soporta únicamente una fuente principal de video.",
            "Necesidad de entrenamiento continuo: La precisión puede disminuir sin actualizaciones regulares.",
            "Factores ambientales: La iluminación deficiente puede afectar la claridad de las imágenes."
          ]
        }
      }
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

// Helper: Flatten hierarchical sections for scroll mapping.
function flattenSections(sections) {
  const flatList = [];
  sections.forEach((section) => {
    flatList.push({ id: section.id, title: section.title, parentId: null });
    if (section.children && section.children.length) {
      section.children.forEach((sub) => {
        flatList.push({
          id: sub.id,
          title: sub.title,
          parentId: section.id
        });
      });
    }
  });
  return flatList;
}

const Documentation = () => {
  const { t, i18n } = useTranslation();

  // Add the gradient animation style to the document head.
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = gradientAnimation;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Define hierarchical sections with sub-sections.
  const sections = [
    {
      id: 'introduction',
      title: t('documentation.introduction'),
      children: [
        { id: 'background', title: t('documentation.background') },
        { id: 'objectives', title: t('documentation.objectives') }
      ]
    },
    {
      id: 'purpose',
      title: t('documentation.purpose'),
      children: []
    },
    {
      id: 'scope',
      title: t('documentation.scope'),
      children: [
        { id: 'scope-person-identification', title: t('documentation.scopePersonIdentification') },
        { id: 'scope-security-monitoring', title: t('documentation.scopeSecurityMonitoring') },
        { id: 'scope-alert-system', title: t('documentation.scopeAlertSystem') },
        { id: 'scope-data-management', title: t('documentation.scopeDataManagement') },
        { id: 'scope-discipline-tracking', title: t('documentation.scopeDisciplinaryTracking') },
        { id: 'scope-faculty-attendance', title: t('documentation.scopeFacultyAttendance') }
      ]
    },
    {
      id: 'product-perspective',
      title: t('documentation.productPerspective'),
      children: []
    },
    {
      id: 'operating-environment',
      title: t('documentation.operatingEnvironment'),
      children: []
    },
    {
      id: 'design-constraints',
      title: t('documentation.designConstraints'),
      children: []
    },
    {
      id: 'abstract',
      title: t('documentation.abstract'),
      children: []
    },
    {
      id: 'problem-statement',
      title: t('documentation.problemStatement'),
      children: []
    },
    {
      id: 'proposed-solution',
      title: t('documentation.proposedSolution'),
      children: []
    },
    {
      id: 'benefits',
      title: t('documentation.benefits'),
      children: []
    },
    {
      id: 'modules',
      title: t('documentation.modules'),
      children: [
        { id: 'modules-user-registration', title: t('documentation.modulesUserRegistration') },
        { id: 'modules-database-management', title: t('documentation.modulesDatabaseManagement') },
        { id: 'modules-camera-integration', title: t('documentation.modulesCameraIntegration') },
        { id: 'modules-alert-system', title: t('documentation.modulesAlertSystem') },
        { id: 'modules-attendance-tracking', title: t('documentation.modulesAttendanceTracking') }
      ]
    },
    {
      id: 'limitations',
      title: t('documentation.systemLimitations'),
      children: []
    }
  ];

  const flatSections = flattenSections(sections);
  const [activeItemId, setActiveItemId] = useState('introduction');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
      const fromTop = window.pageYOffset + 120;
      let currentSectionId = null;
      for (let i = 0; i < flatSections.length; i++) {
        const element = document.getElementById(flatSections[i].id);
        if (element) {
          if (
            element.offsetTop <= fromTop &&
            element.offsetTop + element.offsetHeight > fromTop
          ) {
            currentSectionId = flatSections[i].id;
            break;
          }
        }
      }
      if (currentSectionId) {
        setActiveItemId(currentSectionId);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [flatSections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render sidebar recursively with dropdown functionality.
  const renderSidebar = (items) => {
    return items.map((item) => {
      const isParentActive =
        activeItemId === item.id ||
        (item.children && item.children.some((child) => child.id === activeItemId));
      return (
        <div key={item.id} className="mb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => scrollToSection(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md transition-all ${
                isParentActive ? "text-cyan-400 font-medium" : "hover:bg-gray-700/30 text-gray-300"
              }`}
            >
              {item.title}
            </button>
            {item.children && item.children.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown(item.id); }}
                className="p-1 focus:outline-none"
              >
                {openDropdowns[item.id] ? (
                  <FaChevronDown className="text-gray-300" />
                ) : (
                  <FaChevronRight className="text-gray-300" />
                )}
              </button>
            )}
          </div>
          {item.children && item.children.length > 0 && openDropdowns[item.id] && (
            <div className="ml-4 mt-1">
              {item.children.map((sub) => {
                const isSubActive = activeItemId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => scrollToSection(sub.id)}
                    className={`block w-full text-left px-2 py-1 text-sm rounded-md transition-all ${
                      isSubActive ? "text-cyan-400 font-medium" : "hover:bg-gray-700/30 text-gray-300"
                    }`}
                  >
                    {sub.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  // Handle language change.
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Global custom styles */}
      <style>{`
        ${gradientAnimation}
        /* Animated gradient for header */
        .animate-gradient {
          background: linear-gradient(270deg, #1a1a2e, #16213e, #0f3460, #1a1a2e);
          background-size: 400% 400%;
          animation: gradientWave 12s ease infinite;
        }
        /* Custom scrollbar for the sidebar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
        }
        /* Custom option styling (Note: styling options is browser dependent) */
        select option {
          padding: 0.5rem 1rem;
        }
      `}</style>

      {/* Header */}
      <header 
        className="w-full py-8 shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(270deg, #1a1a2e, #16213e, #0f3460, #1a1a2e)',
          backgroundSize: '400% 400%',
          animation: 'gradientWave 12s ease infinite'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Top */}
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="flex items-center group">
              <img 
                src="/face-trace-logo.png" 
                alt="FaceTrace Logo"
                className="h-28 mr-4 transition-transform group-hover:scale-110"
              />
            </Link>

            {/* Language Selector */}
            <div className="relative group">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg relative">
              <span className="text-gray-300 hidden sm:block">{t('nav.language')} :</span>
                <select
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  defaultValue={i18n.language}
                  className="bg-transparent hover: text-cyan-400 focus:outline-none appearance-none pl-2 pr-2"
                >
                  <option value="en" className="bg-gray-800 ">{t('nav.languages.en')}</option>
                  <option value="ur" className="bg-gray-800 ">{t('nav.languages.ur')}</option>
                  <option value="es" className="bg-gray-800 ">{t('nav.languages.es')}</option>
                </select>
                <span className="absolute right-2 pointer-events-none">
                  <FaChevronDown className="text-cyan-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Giant Text */}
          <h1 className="text-5xl font-extrabold text-center text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              {t('top.giantText')}
            </span>
          </h1>
        </div>
      </header>

      {/* Main Container:
          ADDED flex-col md:flex-row to become vertical on small, horizontal on larger screens. 
       */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar:
            ADDED w-full md:w-64 so it spans full width on mobile, reverts to 64px wide on md+ screens. 
        */}
        <motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start bg-gray-800/50 rounded-xl p-4 backdrop-blur-lg shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar"
>
  <h2 className="text-lg font-bold mb-4 text-white">{t('documentation.title')}</h2>
  <nav>{renderSidebar(sections)}</nav>
</motion.div>


        {/* Documentation Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-grow bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-xl p-8"
        >
          {/* Introduction */}
          <section id="introduction" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.introduction')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.introductionDesc')}
            </p>
          </section>

          {/* Background */}
          <section id="background" className="mb-16 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.background')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.backgroundDesc')}
            </p>
          </section>

          {/* Objectives */}
          <section id="objectives" className="mb-16 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.objectives')}</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300 text-lg leading-relaxed space-y-2">
              {t('documentation.objectivesList', { returnObjects: true }).map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </section>

          {/* Purpose */}
          <section id="purpose" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.purpose')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.purposeDesc')}
            </p>
          </section>

          {/* Scope */}
          <section id="scope" className="mb-8 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.scope')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeDesc')}
            </p>
          </section>

          {/* Scope -> Person Identification */}
          <section id="scope-person-identification" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopePersonIdentification')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopePersonIdentificationDesc')}
            </p>
          </section>

          {/* Scope -> Security Monitoring */}
          <section id="scope-security-monitoring" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopeSecurityMonitoring')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeSecurityMonitoringDesc')}
            </p>
          </section>

          {/* Scope -> Alert System */}
          <section id="scope-alert-system" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopeAlertSystem')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeAlertSystemDesc')}
            </p>
          </section>

          {/* Scope -> Data Management */}
          <section id="scope-data-management" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopeDataManagement')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeDataManagementDesc')}
            </p>
          </section>

          {/* Scope -> Disciplinary Tracking */}
          <section id="scope-discipline-tracking" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopeDisciplinaryTracking')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeDisciplinaryTrackingDesc')}
            </p>
          </section>

          {/* Scope -> Faculty Attendance */}
          <section id="scope-faculty-attendance" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.scopeFacultyAttendance')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.scopeFacultyAttendanceDesc')}
            </p>
          </section>

          {/* Product Perspective */}
          <section id="product-perspective" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.productPerspective')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.productPerspectiveDesc')}
            </p>
          </section>

          {/* Operating Environment */}
          <section id="operating-environment" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.operatingEnvironment')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              {t('documentation.operatingEnvironmentDesc')}
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-300 text-lg leading-relaxed space-y-2">
              {t('documentation.operatingEnvironmentDetails', { returnObjects: true }).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </section>

          {/* Design & Implementation Constraints */}
          <section id="design-constraints" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.designConstraints')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.designConstraintsDesc')}
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-300 text-lg leading-relaxed mt-4 space-y-2">
              {t('documentation.designConstraintsDetails', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Abstract */}
          <section id="abstract" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.abstract')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.abstractDesc')}
            </p>
          </section>

          {/* Problem Statement */}
          <section id="problem-statement" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.problemStatement')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.problemStatementDesc')}
            </p>
          </section>

          {/* Proposed Solution */}
          <section id="proposed-solution" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.proposedSolution')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.proposedSolutionDesc')}
            </p>
          </section>

          {/* Benefits */}
          <section id="benefits" className="mb-16 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.benefits')}</h2>
            <ul className="list-disc list-inside ml-4 text-gray-300 text-lg leading-relaxed space-y-2">
              {t('documentation.benefitsList', { returnObjects: true }).map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </section>

          {/* Modules */}
          <section id="modules" className="mb-8 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.modules')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              {t('documentation.modulesDesc')}
            </p>
          </section>

          {/* Modules -> User Registration */}
          <section id="modules-user-registration" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.modulesUserRegistration')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.modulesUserRegistrationDesc')}
            </p>
          </section>

          {/* Modules -> Database Management */}
          <section id="modules-database-management" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.modulesDatabaseManagement')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.modulesDatabaseManagementDesc')}
            </p>
          </section>

          {/* Modules -> Camera Integration */}
          <section id="modules-camera-integration" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.modulesCameraIntegration')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.modulesCameraIntegrationDesc')}
            </p>
          </section>

          {/* Modules -> Alert System */}
          <section id="modules-alert-system" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.modulesAlertSystem')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.modulesAlertSystemDesc')}
            </p>
          </section>

          {/* Modules -> Attendance Tracking */}
          <section id="modules-attendance-tracking" className="mb-12 scroll-mt-28">
            <h3 className="text-2xl font-semibold mb-4 text-white">{t('documentation.modulesAttendanceTracking')}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('documentation.modulesAttendanceTrackingDesc')}
            </p>
          </section>

          {/* System Limitations */}
          <section id="limitations" className="mb-8 scroll-mt-28">
            <h2 className="text-3xl font-bold mb-6 text-white">{t('documentation.systemLimitations')}</h2>
            <ul className="list-disc list-inside ml-4 text-gray-300 text-lg leading-relaxed space-y-2">
              {t('documentation.systemLimitationsList', { returnObjects: true }).map((limit, index) => (
                <li key={index}>{limit}</li>
              ))}
            </ul>
          </section>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-cyan-600/30 backdrop-blur-sm rounded-full shadow-lg hover:bg-cyan-500/40 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaArrowUp className="text-cyan-400" />
        </motion.button>
      )}

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Documentation;