import React, { Component } from 'react';
import {
  Table,
  Button,
  notification,
  Spin,
  Space,
  Popconfirm,
} from 'antd';
import { connect } from 'react-redux';
import { instance as api } from '../../../axios';
import './ProductList.css';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      templateId: null,
      categoryId: null,
      dataFetching: true,
      bulkdelete: false,
      products: {
        data: [],
        names: [],
      },
      columns: [],
    };
    this.onConfirm=this.onConfirm.bind(this)
  }
  async refreshProducts() {
    const query = new URLSearchParams(this.props.location.search);
    let categoryId = query.get('category');
    let products = [];
    if (categoryId !== null) {
      console.log(categoryId);
      this.setState({ categoryId });
      let { data } = await api.get('/product/category/' + categoryId);
      products = data;
      if (products.length !== 0)
        this.setState({ templateId: products[0].template });
    } else {
      let { data } = await api.get('/product/');
      console.log(data);
      products = data;
    }

    // For earlier products that didn't have any data
    products = products.filter((prod) => prod.data !== '{}');
    const sdatas = products.map((product) => {
      return JSON.parse(product.data);
    });
    const namesm = products.map((product) => {
      if (JSON.parse(product.data).manufacturer === undefined) {
        // For earlier products that didn't have manuf, model defined.
        product.manufacturer = '--Not defined--';
      }
      let updates = product.meta.update;
      return {
        manufacturer: JSON.parse(product.data).manufacturer,
        model: JSON.parse(product.data).model,
        name:
          JSON.parse(product.data).manufacturer +
          '-' +
          JSON.parse(product.data).model,
        image: JSON.parse(product.data).image,
        description: JSON.parse(product.data).description,
        price: JSON.parse(product.data).price,
        data: JSON.parse(product.data),
        created_at: product.meta.created_at,
        updated_at:
          updates.length > 0
            ? updates.slice(updates.length - 1)[0].updated_at
            : '-',
        template: product.template,
        category: product.category,
        id: product._id,
        key: product._id,
      };
    });
    this.setState({ products: { data: sdatas, names: namesm } });
  }
  async componentDidUpdate() {
    if (this.state.bulkdelete === true) {
      await this.refreshProducts();
      this.setState({ bulkdelete: false });
    }
  }
  async onConfirm() {
    try {
      const result = await api.put(
        `/product/bulkDelete/${this.state.categoryId}`
      );
      notification['success']({
          message:result.data.message?result.data.message:''
      })
      await this.refreshProducts();
    } catch (error) {
        notification['error']({
            message:'Something went wrong'
        })
    }   
  }
  async componentDidMount() {
    try {
      await this.refreshProducts();
      let names = this.state.products.names;
      let data = this.state.products.data;

      const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          filters: names.map((prod) => ({ text: prod.name, value: prod.name })),
        },
        {
          title: 'Created At',
          dataIndex: 'created_at',
          key: 'created_at',
          defaultSortOrder: 'descend',
          sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
          title: 'Update At',
          dataIndex: 'updated_at',
          key: 'updated_at',
          sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
        },
      ];
      columns.push(
        {
          title: 'Add a product using existing product',
          key: 'name',
          width: 200,
          render: (item) => {
            return (
              <Button
                onClick={async (e) => {
                  let a = await this.props.setFormData({ formData: item.data });
                  // Due to asynchronous behaviour, the above line does not work without the setTimeout
                  if (typeof a === 'object') {
                    setTimeout(() => {
                      let path = `addproduct?category=${item.category._id}&template=${item.template._id}`;
                      window.location.href = path;
                    }, 1000);
                  }
                }}
              >
                Make a Copy
              </Button>
            );
          },
        },
        {
          title: 'Make changes to existing product',
          key: 'name',
          width: 200,
          render: (item) => {
            return (
              <Button
                onClick={async (e) => {
                  let a = await this.props.setFormData({ formData: item.data });
                  // Due to asynchronous behaviour, the above line does not work without the setTimeout
                  if (typeof a === 'object') {
                    setTimeout(() => {
                      let path = `addproduct?category=${item.category._id}&template=${item.template._id}&product=${item.id}`;
                      window.location.href = path;
                    }, 1000);
                  }
                }}
              >
                Edit
              </Button>
            );
          },
        },
        {
          title: 'Delete Product',
          key: 'name',
          fixed: 'right',
          width: 100,
          render: (item) => {
            return (
              <Button
                onClick={async (e) => {
                  const resp = await api.delete(
                    `/product/${item.category._id}/${item.id}`
                  );
                  if (resp.status === 204) {
                    notification['success']({
                      message: 'Product Deleted',
                      description:
                        'This product was deleted from the database.',
                    });
                    await this.refreshProducts();
                    // window.location.href = 'product'
                  } else {
                    notification['error']({
                      message: 'An Error Occurred',
                      description:
                        'There was an error while deleting this product.',
                    });
                  }
                }}
              >
                Remove Product
              </Button>
            );
          },
        }
      );

      this.setState({
        products: { data, names },
        columns,
        dataFetching: false,
      });
    } catch (e) {
      console.log(e);
      notification['error']({
        message: 'An Error Occurred',
        description: 'There was an error while displaying products.',
      });
    }
  }

  render() {
    return (
      <div className="container main-container">
        <h3>
          {this.state.templateId
            ? 'Listing Products based on Template'
            : 'Listing all Products'}
        </h3>
        <div className="space">
          {this.state.categoryId !== null ? (
            <Popconfirm
              title="Are you sure you want to delete all the Products?"
              onConfirm={this.onConfirm}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary">Delete all products</Button>
            </Popconfirm>
          ) : null}
        </div>
        <div style={{ display: 'flex' }}>
          {!this.state.dataFetching ? (
            <Table
              dataSource={this.state.products.names}
              columns={this.state.columns}
            />
          ) : (
            <Space size="middle">
              <Spin />
            </Space>
          )}
        </div>
        {this.state.categoryId && this.state.templateId ? (
          <Button
            style={{ marginLeft: '45%' }}
            href={`/addproduct?template=${this.state.templateId}&category=${this.state.categoryId}`}
          >
            Add Product
          </Button>
        ) : null}
      </div>
    );
  }
}

export default connect(
  ({ formData }) => ({
    formData,
  }),
  (dispatch) => ({
    setFormData: ({ formData }) =>
        dispatch({
            type: 'FORM_DATA_SET',
            payload: formData,
        }),
}))(withAuthenticationRequired(ProductList));
