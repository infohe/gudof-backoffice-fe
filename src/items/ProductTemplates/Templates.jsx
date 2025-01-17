import React, { Component } from 'react';
import { connect } from "react-redux";
import './css';
import { Layout, Tabs, Card ,Input, Button,Checkbox} from 'antd';
import Tree from './Tree';
import { FormView } from "./views";
import NodeEditor from './Editor';
import Toolbar from './Toolbar';
import Settings from './Settings';
import { instance as api } from "../../axios";

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;

class NewTemplate extends Component {
    state = {
        collapsed: false,
        categoryId: null,
        templateId: null,
        searchable:[],
        stringFacet:[],
        numberFacet:[],
        def_searchable:[],
        def_stringFacet:[],
        def_numericFacets:[],
        viewfacets:false,
        schema:Object.entries(this.props.schema.properties).map(function ([key,val]) {
           return {label:val.title,value:key};
      })
    };
    componentWillMount() {
      this.props.setFormData({ formData: {} })
      this.props.defaultMenu();
    }
    componentDidMount () {
      // To remove the inline icons (Delete, etc) which are present in Template page
      this.props.updateSettings({ isInlineMode: true })
      const query = new URLSearchParams(this.props.location.search)
      let categoryId = query.get('category'), templateId = query.get('template')
      let res = this.getTemplate(templateId)
      console.log("res",res)
      this.setState({categoryId, templateId})
    }
    async getTemplate(templateId) {
      try{
        if(templateId!==null){
          let template = await api.get(`templates/${templateId}`)
          console.log("tempalte",template.data)
          this.setState({
            def_stringFacet:template.data.stringFacet,
            def_numericFacets:template.data.numericFacets,
            def_searchable:template.data.searchable,
          })
        }
        this.setState({viewfacets:true})
        
        
      }catch (e){
        return e
      }
      
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    render() {
        const { settings } = this.props;
        return (
            <Layout>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    width={settings.leftSiderWidth}
                    style={{
                        background: '#fff',
                        padding: 0,
                        overflow: 'auto',
                        boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                    }}
                >
                    <Tabs defaultActiveKey="0" size="small" type="card">
                        <TabPane tab="Editor" style={{ padding: '8px' }} key="0">
                            <Tree />
                        </TabPane>
                        <TabPane tab="Settings" style={{ padding: '8px' }} key="1">
                            <Settings />
                        </TabPane>
                    </Tabs>
                </Sider>
                <Layout style={{ marginLeft: settings.leftSiderWidth }}>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        <Toolbar category={this.state.categoryId} template={this.state.templateId} stringFacet={this.state.stringFacet} numberFacet={this.state.numberFacet} searchable={this.state.searchable}/>
                    </Header>
                    <Content style={{ minHeight: 280, padding: '12px 8px' }}>
                        <Card
                            bordered={false}
                            style={{ width: settings.formWidth, margin: '12px 8px', display: 'inline-block', verticalAlign: 'top' }}
                        >
                            <FormView />
                           
                           {/* If no template exists show this */}
                           {/* Else put a button to update facets */}
                         {this.state.viewfacets &&  
                          <div>String Facet
                             <Checkbox.Group options={Object.entries(this.props.schema.properties).map(function ([key,val]) {
                                return {label:key,value:key};
                            })} defaultValue={this.state.def_stringFacet} onChange={(e)=>{this.setState({stringFacet:e})}} />
                                                        Number Facet
                            <Checkbox.Group options={Object.entries(this.props.schema.properties).map(function ([key,val]) {
                                return {label:val.title,value:key};
                            })} defaultValue={this.state.def_numericFacets} onChange={(e)=>{this.setState({numberFacet:e})}}/>

                              Searchable
                              <Checkbox.Group defaultValue={this.state.def_searchable} options={Object.entries(this.props.schema.properties).map(function ([key,val]) {
                                return {label:val.title,value:key};
                            })} onChange={(e)=>{this.setState({searchable:e})}}/>

</div>}

                            <Button onClick={async()=>{await api.post(`templates/${this.state.templateId}`)}}>Set Facets</Button>
                        </Card>
                        <br/>
        
        
                        {/* {(settings.subViews || []).map((a) => {
                            const style = { margin: '12px 8px', width: 400, display: 'inline-block', verticalAlign: 'top' };
                            switch (a) {
                              case "schema":
                                return (
                                  <Card
                                    key="schema"
                                    title="Schema"
                                    style={style}
                                  >
                                    <SchemaView />
                                  </Card>
                                );
                              case "uiSchema":
                                return (
                                  <Card
                                    key="uischema"
                                    title="UiSchema"
                                    style={style}
                                  >
                                    <UiSchemaView />
                                  </Card>
                                );
                              default:
                                return <div key="null" />;
                            }
                        })} */}
                    </Content>
                </Layout>
              <Sider
                width={this.props.activeNodeKey ? settings.rightSiderWidth : 0}
                style={{
                  overflow: 'auto',
                  background: '#fff',
                  boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 2px 3px 0 rgba(0, 0, 0, 0.2)',
                  position: 'fixed',
                  height: '100vh',
                  right: 0,
                }}
              >
                <NodeEditor />
              </Sider>
            </Layout>
        );
    }
}

export default connect(({
  tree: {
    present: [{ name, schema, uiSchema }],
  },
  formData,
  settings: { isLiveValidate },
activeNodeKey, settings }) => ({
  name,schema,uiSchema,formData,
  activeNodeKey,
  settings,
}), (dispatch) => ({
  setFormData: ({ formData }) =>
    dispatch({
      type: 'FORM_DATA_SET',
      payload: formData,
    }),
    updateSettings: (payload) =>
      dispatch({
        type: 'SETTINGS_UPDATE',
        payload,
      }),
    defaultMenu: () =>
      dispatch({
        type: 'MENU_DEFAULT',
        payload: {},
      }),
}))(NewTemplate);

// export default NewTemplate;