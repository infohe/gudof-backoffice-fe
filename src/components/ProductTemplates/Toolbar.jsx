import React from 'react';
import axios from "axios";
import { connect } from 'react-redux';
import { Button, Tooltip, Select, Modal, notification, List } from 'antd';
import { FileAddOutlined, FolderOpenOutlined, SaveOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { ActionTypes } from 'redux-undo';
import './index.css';

const buttonStyle = { marginLeft: 8 };
class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      templates: [],
      templateId: null
    };
  }

  async componentDidMount() {
    const { data: templates } = await axios.get(
      "https://infohebackoffice.herokuapp.com/templates"
    );
    this.setState({ templates });
  }

  newTemplate = () => {
    this.setState({ templateId: null })
  }

  save = async () => {
    const { name, schema, uiSchema } = this.props.tree.present[0];
    const body = {
        name,
      category_id: "5ef5e95f6d957a00173e32b5",
        formSchema: JSON.stringify(schema),
        uiSchema: (uiSchema !== undefined) ? JSON.stringify(uiSchema) : "",
      };
    try {
      let resp;

      if(this.state.templateId === null) {
        resp = await axios.post(
          "https://infohebackoffice.herokuapp.com/templates",
          body
        );
      } else {
        resp = await axios.patch(
          "https://infohebackoffice.herokuapp.com/templates",
          body
        );
      }
      const response = resp.status;
      if (response === 201) {
        notification.open({
          message: 'Template Created',
          description:
          'Your new template was added to the database.'
        });
      }
    } catch (e) {
      console.log(e);
      notification.open({
        message: 'Sorry, Template could not be created.',
        description: 'There was some error in the backend'
      })
    }
  };

  showTemplates = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  };

  renderThisTemplate = async (_id) => {
    let [thisTemplate] = this.state.templates.filter(template => template._id === _id)
    let schema = JSON.parse(thisTemplate.formSchema), uiSchema = {}, name = thisTemplate.name
    if (thisTemplate.uiSchema !== "") {
      uiSchema = JSON.parse(thisTemplate.uiSchema)
    }
    this.props.setTree({ name, schema, uiSchema });
    this.setState({ visible: false, existingTemplate: true, templateId: thisTemplate._id })
  }

  render() {
    const { tree, undo, redo, settings, updateSettings, newForm } = this.props;
    const { past, future } = tree;
    return (
      <span>
        <Tooltip title="New" onClick={this.newTemplate}>
          <Button
            style={buttonStyle}
            onClick={newForm}
            icon={<FileAddOutlined />}
          />
        </Tooltip>
        <Tooltip title="Open">  
          <Button
            style={buttonStyle}
            onClick={() => this.showTemplates()}
            icon={<FolderOpenOutlined />}
          />
        </Tooltip>
        <Tooltip title="Save">
          <Button
            style={buttonStyle}
            onClick={this.save}
            icon={<SaveOutlined />}
          />
        </Tooltip>
        <Tooltip title="Undo">
          <Button
            style={buttonStyle}
            onClick={undo}
            disabled={!past.length}
            icon={<UndoOutlined />}
          />
        </Tooltip>
        <Tooltip title="Redo">
          <Button
            style={buttonStyle}
            onClick={redo}
            disabled={!future.length}
            icon={<RedoOutlined />}
          />
        </Tooltip>
        <Select
          mode="multiple"
          style={{ width: 290, marginLeft: 12 }}
          value={settings.subViews}
          onChange={updateSettings}
          placeholder="Select sub views..."
        >
          <Select.Option key="schema">Schema</Select.Option>
          <Select.Option key="uiSchema">Ui Schema</Select.Option>
          <Select.Option key="formData">Data</Select.Option>
        </Select>
        <Modal
          title="View Existing Templates"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleOk}
          footer={[
            <Button key="back" onClick={this.handleOk}>
              Okay
            </Button>,
          ]}
        >
          <List
            bordered
            dataSource={this.state.templates}
            renderItem={item => (
              <List.Item 
                className="template-list" 
                onClick={() => this.renderThisTemplate(item._id)}
              >
                {item.name}
              </List.Item>
            )}
          />
        </Modal>
      </span>
    );
  }
}

export default connect(
    ({ tree, settings }) => ({ tree, settings }),
    (dispatch) => ({
        newForm: () =>
            dispatch({
                type: 'TREE_CLEAR',
            }),
        setTree: (payload) =>
            dispatch({
                type: 'TREE_SET_TREE',
                payload,
            }),
        undo: () => dispatch({ type: ActionTypes.UNDO }),
        redo: () => dispatch({ type: ActionTypes.REDO }),
        updateSettings: (subViews) =>
            dispatch({
                type: 'SETTINGS_UPDATE',
                payload: { subViews },
            }),
    })
)(Toolbar);