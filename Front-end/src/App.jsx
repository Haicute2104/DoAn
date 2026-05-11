import './App.css'
import AllRoute from './components/AllRoutes'
import { NotificationProvider } from './components/providers/NotificationProvider'
import { AuthProvider } from './components/providers/AuthProvider'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

function App() {

  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <NotificationProvider>
          <AllRoute/>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
