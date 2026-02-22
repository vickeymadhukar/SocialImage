import { Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar'
import Home from './routes/Home';
import Search from './routes/Search';
import Upload from './routes/Upload';
import Setting from './routes/setting';
import UserBoard from './routes/UserBoard';


const App = () => {
 

  return (
    <div >
  <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/user" element={<UserBoard/>} />
        <Route path="/upload" element={<Upload/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/setting" element={<Setting/>} />
      </Routes>


      <Navbar/>
    </div>
  )
}

export default App
