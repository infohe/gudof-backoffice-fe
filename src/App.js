import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css';
import "./index.css";
import {instance as api} from "./axios.js";

import Category from './items/Categories/Categories';
import Products from './items/Products';
import NewTemplate from './items/ProductTemplates/Templates.jsx';
import List from './items/ProductTemplates/List';
import ProductList from './items/Products/List/ProductList';
import ReactFileReader from 'react-file-reader'
import { Provider, connect } from "react-redux";
import { store, persistor } from "./items/ProductTemplates/store";
import { PersistGate } from "redux-persist/integration/react";
import { Menu, Layout } from "antd";
import {
  ContainerOutlined,
  UnorderedListOutlined,
  DatabaseFilled,
} from "@ant-design/icons";
import FormData from 'form-data';
import { Input } from '@material-ui/core';

const { Content } = Layout;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "category",
      categname:''
    };
  }

  componentWillMount () {
    const pathname = window.location.pathname,
      secondslash = pathname.indexOf('/', 1) > 0 ? pathname.indexOf('/', 1) + 1 : -1; 
    let location;
    if (secondslash === -1) {
      location = pathname.slice(1);
    } else {
      location = pathname.slice(1, secondslash);
    }
    location = location === '' ? 'category' : location;
    location = location === 'addproduct' ? 'product' : location;
    location = location === 'viewtemplates' ? 'template' : location;
    this.setState({ current: location })
  }

  handleClick = (e) => {
    console.log("click ", e);
    this.setState({ current: e.key });
  };
  handleFiles = async(file,category_name) => {
    const fData = new FormData();
    fData.append("file",file[0],file[0].name);
    let body = {
      formData : fData,
      category_name : category_name
    }
    let resp = await api.post(
      "/user/fileupload",
      body
    );
  }
  render() {
    const { current } = this.state;
    return (
      <Router>
        <div className="App">
          <Menu
            theme="dark"
            onClick={this.handleClick}
            selectedKeys={[current]}
            mode="horizontal"
          >
            <Menu.Item key="category" icon={<UnorderedListOutlined />}>
              <Link to="/category">Categories</Link>
            </Menu.Item>
            <Menu.Item key="template" icon={<ContainerOutlined />}>
              <Link to="/viewtemplates">Product Templates</Link>
            </Menu.Item>
            <Menu.Item key="product" icon={<DatabaseFilled />}>
              <Link to="/product">Products</Link>
            </Menu.Item>
            <Menu.Item key="product" icon={<DatabaseFilled />}>
           
</Menu.Item>
          </Menu>
          <Layout>
            <Content>
              <Input type="text" placeholder="Category name" onChange={(e)=>this.setState({
                categname:e.target.value
              })}/><br/>
              Upload csv file<br/>
            <ReactFileReader handleFiles={(e)=>this.handleFiles(e,this.state.categname)} fileTypes={'.csv'}>
            <button className='btn'>Upload</button>
        </ReactFileReader>
              <Route path={["/category", "/"]} exact>
                <Category />
              </Route>
              <Route path="/template" component={NewTemplate} />
              <Route path="/viewtemplates" component={List} />
              <Route path="/product" component={ProductList} />
              <Route path="/addproduct/" component={Products} />
            </Content>
          </Layout>
        </div>
      </Router>
    );
  }
}

const AppContainer = connect(({ activeNodeKey, settings }) => ({
  activeNodeKey,
  settings,
}))(App);
export default () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppContainer />
    </PersistGate>
  </Provider>
);
