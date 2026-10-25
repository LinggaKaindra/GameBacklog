import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Navbar from './components/Navbar/Navbar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

import Home from './pages/Home/Home'
import Discover from './pages/Discover/Discover'
import GameDetail from './pages/GameDetail/GameDetail'
import Library from './pages/Library/Library'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/discover"
          element={<Discover />}
        />

        <Route
          path="/game/:id"
          element={<GameDetail />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  )
}

export default App