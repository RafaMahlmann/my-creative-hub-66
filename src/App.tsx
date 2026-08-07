import "./i18n";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import CourseIndex from "./pages/CourseIndex";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import CourseAdmin from "./pages/admin/CourseAdmin";
import VideoLibrary from "./pages/admin/VideoLibrary";
import CourseEditor from "./pages/admin/CourseEditor";
import LessonEditor from "./pages/admin/LessonEditor";
import StudentAuth from "./pages/StudentAuth";
import MyLessons from "./pages/MyLessons";
import Students from "./pages/admin/Students";
import SegurancaPage from "./pages/SegurancaPage";
import { StudentConsentGate } from "./components/course/StudentConsentGate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bioressonancia" element={<Navigate to="/" />} />
            <Route path="/curso" element={<CourseIndex />} />
            <Route path="/curso/entrar" element={<StudentAuth />} />
            <Route path="/curso/seguranca" element={<SegurancaPage />} />
            <Route
              path="/curso/minhas-aulas"
              element={
                <StudentConsentGate>
                  <MyLessons />
                </StudentConsentGate>
              }
            />
            <Route path="/curso/admin" element={<CourseAdmin />} />
            <Route path="/curso/admin/alunos" element={<Students />} />
            <Route path="/curso/admin/videos" element={<VideoLibrary />} />
            <Route path="/curso/admin/:courseId" element={<CourseEditor />} />

            <Route path="/curso/admin/:courseId/aula/:lessonId" element={<LessonEditor />} />
            <Route
              path="/curso/:courseSlug"
              element={
                <StudentConsentGate>
                  <CoursePage />
                </StudentConsentGate>
              }
            />
            <Route
              path="/curso/:courseSlug/:lessonSlug"
              element={
                <StudentConsentGate>
                  <LessonPage />
                </StudentConsentGate>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
