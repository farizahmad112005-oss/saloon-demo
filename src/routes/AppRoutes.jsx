import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/customer/Home';
import Services from '../pages/customer/Services';
import Packages from '../pages/customer/Packages';
import Booking from '../pages/customer/Booking';
import Appointments from '../pages/customer/Appointments';
import Reviews from '../pages/customer/Reviews';
import About from '../pages/customer/About';
import Contact from '../pages/customer/Contact';
import Login from '../pages/customer/Login';
import AdminLogin from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import AdminAppointments from '../pages/admin/Appointments';
import AdminCategories from '../pages/admin/Categories';
import AdminServices from '../pages/admin/Services';
import AdminPackages from '../pages/admin/Packages';
import AdminDiscounts from '../pages/admin/Discounts';
import AdminBanners from '../pages/admin/Banners';
import AdminFeedback from '../pages/admin/Feedback';
import AdminCustomers from '../pages/admin/Customers';
import AdminSettings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/Profile';
import AdminSlots from '../pages/admin/Slots';
import AdminStaff from '../pages/admin/Staff';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="packages" element={<Packages />} />
        <Route path="booking" element={<Booking />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="slots" element={<AdminSlots />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="discounts" element={<AdminDiscounts />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
