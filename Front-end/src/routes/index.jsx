import LayoutDefault from "../LayoutDefault";
import ActivateAccount from "../pages/Auth/activeAccount";
import Dashboard from "../pages/Dashboard";
import AuthComponent from '../components/UI/authComponent/AuthComponent';
import ResetPassword from "../pages/Auth/resetPassword";
import { PrivateRoute, PublicRoute } from "../helpers/RouteGuards";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import CreateProduct from "../pages/Products/createProduct";
import EditProduct from "../pages/Products/editProduct";
import Collections from "../pages/Collection";
import Contact from "../pages/Contact";
import News from "../pages/News";
import CreateNews from "../pages/News/create";
import EditNews from "../pages/News/edit";
import Stocks from "../pages/Stocks";
import AccountsAdmin from "../pages/Accounts/Admin";
import AccountsUsers from "../pages/Accounts/Users";
import Orders from "../pages/Orders";
import Report from "../pages/Report";
export const routes = [

  {
    path: "/",
    element: <PrivateRoute><LayoutDefault /></PrivateRoute>,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "products",
        element: <Products />,

      },
      {
        path: "products/create",
        element: <CreateProduct />
      },
      {
        path: "products/edit/:id",
        element: <EditProduct />
      },
      {
        path: "categories",
        element: <Categories />
      },
      {
        path: "collections",
        element: <Collections />
      },
      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "news",
        element: <News />
      },
      {
        path: "news/create",
        element: <CreateNews />
      },
      {
        path: "news/edit/:id",
        element: <EditNews />
      },
      {
        path: "stock",
        element: <Stocks />
      },
      {
        path: "accounts/users",
        element: <AccountsUsers/>
      },
      {
        path: "accounts/admins",
        element: <AccountsAdmin />
      },
      {
        path: "orders",
        element: <Orders />
      },
      {
        path: "report",
        element: <Report />
      }
    ],

  },
  {
    path: "/auth",
    element: <PublicRoute><AuthComponent /></PublicRoute>
  },
  {
    path: "/activate-account",
    element: <ActivateAccount />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  }

]