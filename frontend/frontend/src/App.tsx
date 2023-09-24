import { Routes, Route } from 'react-router-dom'

import AuthPage from './pages/auth/index'
import HomePage from './pages/home/index'
import ProfilePage from './pages/profile/index'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App
