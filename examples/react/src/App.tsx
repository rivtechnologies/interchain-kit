import { Link, Outlet, Route, Routes } from "react-router-dom";
import E2ETest from "./pages/all-wallets";
import ActiveWallet from "./pages/active-wallet";

function Layout() {
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<E2ETest />} />
        <Route path='active-wallet' element={<ActiveWallet />} />
      </Route>
    </Routes>
  )
}