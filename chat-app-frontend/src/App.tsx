import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
// import LoginPage from "./components/Login";
// import SignUpPage from "./components/Signup";
// import Home from "./components/Home";
// import Chat from "./components/Chat";
// import Users from "./components/User";
// import Personal from "./components/Personal";
import Spinner from "./components/Spinner";
import PageNotFound from "./components/PageNotfound";
const Chat = lazy(() => import("./components/Chat"));
const Home = lazy(() => import("./components/Home"));
const SignUpPage = lazy(() => import("./components/Signup"));
const LoginPage = lazy(() => import("./components/Login"));
const Users = lazy(() => import("./components/User"));
const Personal = lazy(() => import("./components/Personal"));
function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Home />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="users" element={<Users />} />
            <Route path="/:username1/:username2" element={<Personal />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-right"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </>
  );
}

export default App;
