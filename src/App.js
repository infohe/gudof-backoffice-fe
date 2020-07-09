import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './App.css';
import "./index.css";
import Category from './components/Categories/Categories';
import Products from './components/Products';
import NewTemplate from './components/ProductTemplates/Templates.jsx';

import { Provider, connect } from "react-redux";
import { store, persistor } from "./components/ProductTemplates/store";
import { PersistGate } from "redux-persist/integration/react";
import { Menu } from "antd";
import {
  ContainerOutlined,
  UnorderedListOutlined,
  DatabaseFilled,
} from "@ant-design/icons";

const { SubMenu } = Menu;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "category",
    };
  }

  handleClick = (e) => {
    console.log("click ", e);
    this.setState({ current: e.key });
  };

  render() {
    const { current } = this.state;
    return (
      <Router>
        <div className="App">
          <Menu
            onClick={this.handleClick}
            selectedKeys={[current]}
            mode="horizontal"
          >
            <Menu.Item key="category" icon={<UnorderedListOutlined />}>
              <Link to="/category">View Categories </Link>
            </Menu.Item>
            {/* <SubMenu
              icon={<SettingOutlined />}
              title="Navigation Three - Submenu"
            >
              <Menu.ItemGroup title="Item 1">
                <Menu.Item key="setting:1">Option 1</Menu.Item>
                <Menu.Item key="setting:2">Option 2</Menu.Item>
              </Menu.ItemGroup>
              <Menu.ItemGroup title="Item 2">
                <Menu.Item key="setting:3">Option 3</Menu.Item>
                <Menu.Item key="setting:4">Option 4</Menu.Item>
              </Menu.ItemGroup>
            </SubMenu> */}
            <Menu.Item key="template" icon={<ContainerOutlined />}>
              <Link to="/template">View Product Templates</Link>
            </Menu.Item>
            <Menu.Item disabled key="product" icon={<DatabaseFilled />}>
              <Link> View Products</Link>
            </Menu.Item>
          </Menu>
          <Switch>
            <Route path={["/category", "/"]} exact>
              <Category />
            </Route>
            <Route path={"/template"} exact>
              <NewTemplate />
            </Route>
            <Route path="/product/:id" component={Products} />
          </Switch>
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


// export default App;
