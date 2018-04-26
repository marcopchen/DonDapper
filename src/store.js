import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import axios from 'axios';

const authCall = (reqType, path, body) => {
  const token = window.localStorage.getItem('token');
  if (!token) {
    throw { err: 'Not authorized. Please login' };
  }
  return axios[reqType](path, { headers: { token }, body });
};

/*
CONSTANTS
*/

// PRODUCTS
const GET_PRODUCTS = 'GET_PRODUCTS';
// CATEGORIES
const GET_CATEGORIES = 'GET_CATEGORIES';
// USER
const GET_USER = 'GET_USER';
const LOG_OUT = 'LOG_OUT';
// CART
const GET_CART = 'GET_CART';
// ORDERS
const GET_ORDERS = 'GET_ORDERS';
// LINE ITEMS
const GET_LINE_ITEMS = 'GET_LINE_ITEMS';
const CREATE_LINE_ITEM = 'CREATE_LINE_ITEM';
const UPDATE_LINE_ITEM = 'UPDATE_LINE_ITEM';
//Loader
const LOADING = 'LOADING';
const LOADED = 'LOADED';

/*
THUNKS
*/

// PRODUCTS
const fetchProducts = () => {
  return dispatch => {
    axios
      .get('/api/products')
      .then(res => res.data)
      .then(products => dispatch({ type: GET_PRODUCTS, products }))
      .catch(err => console.log(err));
  };
};

// CATEGORIES
const fetchCategories = () => {
  return dispatch => {
    axios
      .get('/api/categories')
      .then(res => res.data)
      .then(categories => dispatch({ type: GET_CATEGORIES, categories }))
      .catch(err => console.log(err));
  };
};

// USER
const fetchUser = user => {
  return dispatch => {
    axios
      .post(`/api/users/login`, { user })
      .then(res => res.data)
      .then(token => {
        window.localStorage.setItem('token', token);
        return authCall('get', '/api/users');
      })
      .then(res => res.data)
      .then(user => {
        dispatch({ type: GET_USER, user });
      })
      .catch(err => console.log(err));
  };
};

// CART
const fetchCart = userId => {
  return dispatch => {
    authCall('get', `/api/users/${userId}/cart`)
      .then(res => res.data)
      .then(cart => dispatch({ type: GET_CART, cart }))
      .catch(err => console.log(err));
  };
};

// ORDERS
const fetchOrders = userId => {
  return dispatch => {
    authCall('get', `/api/users/${userId}/orders`)
      .then(res => res.data)
      .then(orders => dispatch({ type: GET_ORDERS, orders }))
      .catch(err => console.log(err));
  };
};

// LINE ITEMS
const fetchLineItems = (orderId) => {
  return dispatch => {
    dispatch({ type: LOADING });
    authCall('get', `/api/orders/${orderId}/lineItems`)
      .then(res => res.data)
      .then(lineItems => {
        dispatch({ type: LOADED });
        dispatch({ type: GET_LINE_ITEMS, lineItems });
      })
      .catch(err => {
        console.log(err);
        dispatch({ type: LOADED });
      });
  };
};

const addLineItem = (lineItem, history) => {
  return (dispatch) => {
    axios.post(`/api/lineItems`, lineItem, history)
      // authCall('post', `/api/lineItems`, lineItem)
      .then(res => res.data)
      .then(lineItem => dispatch({ type: CREATE_LINE_ITEM, lineItem }))
      .then(() => {
        history.push(`/cart`);
      })
      .catch(err => console.log(err));
  };
};

const editLineItem = (lineItem, lineItemId, history) => {
  return (dispatch) => {
    axios.put(`/api/lineItems/${lineItemId}`, lineItem)
      // authCall('put', `/api/lineItems/${lineItemId}`, lineItem)
      .then(res => res.data)
      .then(lineItem => dispatch({ type: UPDATE_LINE_ITEM, lineItem }))
      .then(() => {
        history.push(`/cart`);
      })
      .catch(err => console.log(err));
  };
};

const addLineItem = (lineItem) => {
  return dispatch => {
    axios
      .post('/api/lineItems', lineItem)
      .then(res => res.data)
      .then(lineItem => dispatch({ type: ADD_LINE_ITEM, lineItem }))
      .catch(err => console.log(err));
  };
};

const editLineItem = (lineItem, id) => {
  return dispatch => {
    axios
      .put(`/api/lineItems/${id}`, lineItem)
      .then(res => res.data)
      .then(lineItem => dispatch({ type: EDIT_LINE_ITEM, lineItem }))
      .catch(err => console.log(err));
  };
};

/*
REDUCERS
*/

const productsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_PRODUCTS:
      return action.products;
  }
  return state;
};

const categoriesReducer = (state = [], action) => {
  switch (action.type) {
    case GET_CATEGORIES:
      return action.categories;
  }
  return state;
};

const userReducer = (state = [], action) => {
  switch (action.type) {
    case GET_USER:
      return action.user;
    case LOG_OUT:
      return [];
  }
  return state;
};

const cartReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_CART:
      return action.cart;
    case CREATE_LINE_ITEM:
      state.lineItems = [...state.lineItems, action.lineItem];
      break;
    case UPDATE_LINE_ITEM:
      state.lineItems = state.lineItems.map(lineItem => {
        return lineItem.id === action.lineItem.id ? action.lineItem : lineItem;
      });
      break;
  }
  return state;
};

const ordersReducer = (state = [], action) => {
  switch (action.type) {
    case GET_ORDERS:
      return action.orders;
  }
  return state;
};

const lineItemsReducer = (state = [], action) => {
  switch (action.type) {
    case GET_LINE_ITEMS:
      return action.lineItems;
  }
  return state;
};

const loadingReducer = (state = false, action) => {
  switch (action.type) {
    case LOADING:
      return true;
    case LOADED:
      return false;
  }
  return state;
};

const reducer = combineReducers({
  products: productsReducer,
  categories: categoriesReducer,
  user: userReducer,
  cart: cartReducer,
  orders: ordersReducer,
  lineItems: lineItemsReducer,
  loading: loadingReducer
});

const store = createStore(reducer,
  composeWithDevTools(applyMiddleware(thunk)));

export default store;

export {
  fetchProducts,
  fetchCategories,
  fetchUser,
  fetchCart,
  fetchOrders,
  fetchLineItems,
  addLineItem,
  editLineItem
};
