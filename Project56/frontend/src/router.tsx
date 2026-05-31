import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Customize from './pages/Customize';
import Member from './pages/Member';
import Campaigns from './pages/Campaigns';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';

export default function AppRouter() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/customize/:id" component={Customize} />
      <Route path="/member" component={Member} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/cart" component={Cart} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Router>
  );
}
